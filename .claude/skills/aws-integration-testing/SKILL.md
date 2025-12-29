---
name: aws-integration-testing
description: Create integration test documents and evidence using aws-mcp-server script. Retrieve results with read-only commands and generate Markdown evidence. Job execution is performed by the user.
---

# AWS結合テスト

テスト項目書を作成し、aws-mcp-server skillで結果を取得してMarkdownエビデンスを作成します。

## 前提条件

- CDKスタックがデプロイ済みであること
- MFA認証で一時認証情報を取得済みであること
- IAMロールに必要な権限が付与されていること

## AWS操作方法

aws-operations.md に従い、aws-mcp-server skill経由でAWS操作を行う

### スクリプト実行例

```bash
cd .claude/skills/aws-mcp-server && \
  env AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz \
  pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws s3 ls"}'
```

### 利用可能なコマンド

| コマンド                      | 用途                          |
| ----------------------------- | ----------------------------- |
| `tools`                       | 利用可能なMCPツール一覧       |
| `search <query> [limit]`      | AWSドキュメント検索           |
| `api <tool_name> <args_json>` | AWS API呼び出し（参照系のみ） |

## 許可されるコマンド（参照系のみ）

aws-mcp-server skillで使用可能なコマンド

- S3: `aws s3 ls`, `aws s3api list-objects-v2`, `aws s3api get-object`
- DynamoDB: `aws dynamodb query`, `aws dynamodb scan`, `aws dynamodb describe-table`
- Step Functions: `aws stepfunctions describe-execution`, `aws stepfunctions list-executions`
- CloudWatch: `aws cloudwatch get-metric-data`, `aws cloudwatch describe-alarms`
- Logs: `aws logs filter-log-events`, `aws logs describe-log-groups`
- Athena: `aws athena get-query-execution`, `aws athena get-query-results`
- Glue: `aws glue get-database`, `aws glue get-table`, `aws glue get-job-run`

## 禁止されるコマンド

スクリプト内でブロック済み

- create, delete, update, put, terminate, modify, remove, start, stop, reboot

## 禁止される長時間job実行

以下は使用禁止（ユーザーが手動実行）

- `aws stepfunctions start-execution`
- `aws glue start-job-run`
- `aws events put-events`

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
  - 確認方法（使用するコマンド）
- 異常系テストケース
  - 異常条件
  - 期待されるエラー
  - 確認方法
- データ検証項目
  - Athenaクエリ
  - S3確認項目

## エビデンス取得コマンド例

aws-mcp-server skillで以下を実行（cd と環境変数は省略）

### Step Functions 実行結果

```bash
# 実行結果取得（実行はユーザーが行った後）
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws stepfunctions describe-execution --execution-arn arn:aws:states:ap-northeast-1:123456789012:execution:MyStateMachine:exec-id"}'

# 実行履歴一覧
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws stepfunctions list-executions --state-machine-arn arn:aws:states:ap-northeast-1:123456789012:stateMachine:MyStateMachine --status-filter SUCCEEDED"}'
```

### S3 データ確認

```bash
# バケット一覧
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws s3 ls"}'

# オブジェクト一覧
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws s3api list-objects-v2 --bucket bucket-name --prefix path/"}'
```

### CloudWatch Logs

```bash
# ログイベント取得
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws logs filter-log-events --log-group-name /aws/lambda/function-name --filter-pattern ERROR"}'
```

### Glue

```bash
# データベース情報
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws glue get-database --name my_database"}'

# テーブル情報
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws glue get-table --database-name my_database --name my_table"}'
```

### DynamoDB

```bash
# テーブル情報
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws dynamodb describe-table --table-name my-table"}'
```

### ドキュメント検索

```bash
# AWSドキュメント検索
pnpm exec tsx index.ts search "Lambda concurrency" 5
```

## テストフロー

### 正常系テスト

1. テスト項目書を作成
2. ユーザーがState Machineを正常入力で実行
3. スクリプトでSUCCEEDEDステータスを確認
4. 出力データを検証
5. エビデンスを作成

### 異常系テスト

1. テスト項目書を作成
2. ユーザーが不正な入力でState Machineを実行
3. スクリプトでFAILEDステータスを確認
4. エラーメッセージを検証
5. エビデンスを作成

### データ検証テスト

1. テスト項目書を作成
2. S3オブジェクト一覧で出力ファイルの存在確認
3. Glueテーブル情報でスキーマを確認
4. DynamoDBクエリで期待するレコードを確認
5. エビデンスを作成

## 参考

- AWS操作詳細: .claude/rules/aws-operations.md
- スクリプト詳細: .claude/skills/aws-mcp-server/SKILL.md
