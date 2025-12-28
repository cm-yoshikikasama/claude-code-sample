---
name: aws-integration-testing
description: Create integration test documents and evidence using AWS MCP Server. Retrieve results with read-only MCP tools and generate Markdown evidence. Job execution is performed by the user.
---

# AWS結合テスト（MCP版）

テスト項目書を作成し、AWS MCP Serverの参照系ツールで結果を取得してMarkdownエビデンスを作成します。

## 前提条件

- CDKスタックがデプロイ済みであること
- @.claude/rules/aws-operations.md の MFA認証フロー完了済みであること
- 環境変数にAWS認証情報が設定済みであること

## AWS MCP Server利用方法

AWS CLIの代わりに `.claude/skills/aws-mcp-server` スクリプトを使用します。

MCPを直接呼び出さずスクリプト経由にする理由

- トークン効率化（結果を500文字にプレビュー圧縮、90%以上削減）
- 破壊的操作のブロックをコードで強制
- エラーハンドリングの統一

### 基本コマンド

```bash
# プロジェクトルートから実行
# AWS認証情報をインライン環境変数で指定
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz \
  pnpm exec tsx .claude/skills/aws-mcp-server/index.ts <command> <args>
```

### 利用可能なコマンド

| コマンド                      | 用途                          |
| ----------------------------- | ----------------------------- |
| `tools`                       | 利用可能なMCPツール一覧       |
| `search <query> [limit]`      | AWSドキュメント検索           |
| `api <tool_name> <args_json>` | AWS API呼び出し（参照系のみ） |

## 許可されるMCPツール（参照系のみ）

- `s3_ListBuckets`, `s3_ListObjectsV2`, `s3_GetObject`
- `dynamodb_Query`, `dynamodb_Scan`, `dynamodb_DescribeTable`
- `stepfunctions_DescribeExecution`, `stepfunctions_ListExecutions`
- `stepfunctions_DescribeStateMachine`, `stepfunctions_GetExecutionHistory`
- `cloudwatch_GetMetricData`, `cloudwatch_DescribeAlarms`
- `logs_FilterLogEvents`, `logs_DescribeLogGroups`
- `athena_GetQueryExecution`, `athena_GetQueryResults`
- `glue_GetDatabase`, `glue_GetTable`, `glue_GetJobRun`

## 禁止されるMCPツール

aws-mcp-serverスクリプト内でブロック済み（コードレベルで強制）

- create, delete, update, put, terminate, modify, remove, start, stop, reboot

## 禁止される長時間job実行

以下は使用禁止（ユーザーが手動実行）

- `stepfunctions_StartExecution`
- `glue_StartJobRun`
- `events_PutEvents`

理由

- jobによっては30分以上かかりtimeoutする
- 権限管理の観点から実行はユーザーに委ねる

## テストエビデンスの作成

`(プロジェクト)/docs/test-evidence.md` にテスト項目とエビデンスを作成

テンプレートは [test-cases-template.md](test-cases-template.md) を参照

### ファイル内容

- 正常系テストケース
  - 入力データ
  - 期待結果
  - 確認方法（使用するMCPツール）
- 異常系テストケース
  - 異常条件
  - 期待されるエラー
  - 確認方法
- データ検証項目
  - Athenaクエリ
  - S3確認項目

## エビデンス取得コマンド例

### Step Functions 実行結果

```bash
# 実行結果取得（実行はユーザーが行った後）
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "stepfunctions_DescribeExecution" \
  '{"executionArn":"arn:aws:states:ap-northeast-1:123456789012:execution:MyStateMachine:exec-id"}'

# 実行履歴一覧
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "stepfunctions_ListExecutions" \
  '{"stateMachineArn":"arn:aws:states:ap-northeast-1:123456789012:stateMachine:MyStateMachine","statusFilter":"SUCCEEDED"}'

# 実行履歴詳細
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "stepfunctions_GetExecutionHistory" \
  '{"executionArn":"arn:aws:states:..."}'
```

### S3 データ確認

```bash
# バケット一覧
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "s3_ListBuckets" '{}'

# オブジェクト一覧
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "s3_ListObjectsV2" '{"Bucket":"bucket-name","Prefix":"path/"}'

# オブジェクト取得（小さいファイルのみ）
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "s3_GetObject" '{"Bucket":"bucket-name","Key":"path/to/file.json"}'
```

### CloudWatch Logs

```bash
# ログイベント取得
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "logs_FilterLogEvents" \
  '{"logGroupName":"/aws/lambda/function-name","filterPattern":"ERROR"}'

# ロググループ一覧
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "logs_DescribeLogGroups" '{"logGroupNamePrefix":"/aws/stepfunctions/"}'
```

### Glue

```bash
# データベース情報
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "glue_GetDatabase" '{"Name":"my_database"}'

# テーブル情報
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "glue_GetTable" '{"DatabaseName":"my_database","Name":"my_table"}'

# ジョブ実行結果（実行はユーザーが行った後）
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "glue_GetJobRun" '{"JobName":"my-job","RunId":"jr_xxx"}'
```

### DynamoDB

```bash
# テーブル情報
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "dynamodb_DescribeTable" '{"TableName":"my-table"}'

# クエリ実行
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api \
  "dynamodb_Query" '{"TableName":"my-table","KeyConditionExpression":"pk = :pk","ExpressionAttributeValues":{":pk":{"S":"value"}}}'
```

## テストフロー

### 正常系テスト

1. テスト項目書を作成
2. ユーザーがState Machineを正常入力で実行
3. `stepfunctions_DescribeExecution`でSUCCEEDEDステータスを確認
4. 出力データを検証
5. エビデンスを作成

### 異常系テスト

1. テスト項目書を作成
2. ユーザーが不正な入力でState Machineを実行
3. `stepfunctions_DescribeExecution`でFAILEDステータスを確認
4. エラーメッセージを検証
5. エビデンスを作成

### データ検証テスト

1. テスト項目書を作成
2. `s3_ListObjectsV2`で出力ファイルの存在確認
3. `glue_GetTable`でテーブルスキーマを確認
4. `dynamodb_Query`で期待するレコードを確認
5. エビデンスを作成

## AWS CLIとの対応表

| AWS CLI | MCP Tool |
| --- | --- |
| `aws s3 ls` | `s3_ListBuckets`, `s3_ListObjectsV2` |
| `aws stepfunctions describe-execution` | `stepfunctions_DescribeExecution` |
| `aws stepfunctions list-executions` | `stepfunctions_ListExecutions` |
| `aws logs filter-log-events` | `logs_FilterLogEvents` |
| `aws glue get-database` | `glue_GetDatabase` |
| `aws glue get-table` | `glue_GetTable` |
| `aws dynamodb query` | `dynamodb_Query` |

## 参考

- AWS MCP Server詳細: README.md の「AWS MCP Server（Preview）」セクション
- MFA認証フロー: @.claude/rules/aws-operations.md
