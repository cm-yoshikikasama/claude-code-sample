---
name: aws-integration-testing
description: Create integration test documents and evidence using AWS CLI. Retrieve results with read-only commands (describe, get, list) and generate Markdown evidence. Job execution is performed by the user.
---

# AWS結合テスト

テスト項目書を作成し、AWS CLIの参照系コマンドで結果を取得してMarkdownエビデンスを作成します。

## 前提条件

- CDKスタックがデプロイ済みであること
- @.claude/rules/aws-cli.md の MFA認証フロー完了済みであること

## AWS CLIルール

@.claude/rules/aws-cli.md に従う

- MFA認証フロー
- 禁止コマンド
- ユーザー承認

## 許可されるコマンド

- 参照系コマンド（list、describe、get、show 等）
- Athenaクエリ実行（SELECTのみ、DELETE/INSERT/UPDATE禁止）

## 禁止されるコマンド

長時間job実行系コマンドは使用禁止（ユーザーが実行）

- `stepfunctions start-execution`
- `glue start-job-run`
- `events put-events`
- その他の長時間実行系コマンド

理由

- jobによっては30分以上かかりtimeoutする
- 権限管理の観点から実行はユーザーに委ねる

Athenaクエリは短時間で完了するため許可

## テストエビデンスの作成

`(プロジェクト)/docs/test-evidence.md` にテスト項目とエビデンスを作成

テンプレートは [test-cases-template.md](test-cases-template.md) を参照

### ファイル内容

- 正常系テストケース
  - 入力データ
  - 期待結果
  - 確認方法（使用するAWS CLIコマンド）
- 異常系テストケース
  - 異常条件
  - 期待されるエラー
  - 確認方法
- データ検証項目
  - Athenaクエリ
  - S3確認項目

## リソース確認コマンド例

```bash
# S3バケット確認
aws s3 ls | grep PROJECT_NAME

# Step Functions State Machine確認
aws stepfunctions list-state-machines | grep PROJECT_NAME

# Glue Database確認
aws glue get-database --name DATABASE_NAME

# EventBridge Scheduler確認
aws scheduler list-schedules | grep PROJECT_NAME
```

## エビデンス取得コマンド例

### Step Functions

```bash
# 実行結果取得（実行はユーザーが行った後）
aws stepfunctions describe-execution \
  --execution-arn "$EXECUTION_ARN"

# 実行履歴一覧
aws stepfunctions list-executions \
  --state-machine-arn "$STATE_MACHINE_ARN" \
  --status-filter SUCCEEDED
```

### Athena

```bash
# クエリ実行（SELECTのみ許可）
aws athena start-query-execution \
  --query-string "SELECT COUNT(*) FROM db_name.table_name" \
  --work-group "primary"

# クエリ状態確認
aws athena get-query-execution --query-execution-id "$QUERY_ID"

# クエリ結果取得
aws athena get-query-results --query-execution-id "$QUERY_ID"
```

### S3 データ確認

```bash
# バケット内オブジェクト一覧
aws s3 ls s3://BUCKET_NAME/ --recursive

# 特定ファイルの内容確認（小さいファイルのみ）
aws s3 cp s3://BUCKET_NAME/path/to/file.csv - | head -20
```

### CloudWatch Logs

```bash
# エラーログ確認
aws logs filter-log-events \
  --log-group-name "/aws/stepfunctions/STATE_MACHINE_NAME" \
  --filter-pattern "ERROR"
```

## テストフロー

### 正常系テスト

1. テスト項目書を作成
2. ユーザーがState Machineを正常入力で実行
3. describe-executionでSUCCEEDEDステータスを確認
4. 出力データを検証
5. エビデンスを作成

### 異常系テスト

1. テスト項目書を作成
2. ユーザーが不正な入力でState Machineを実行
3. describe-executionでFAILEDステータスを確認
4. エラーメッセージを検証
5. エビデンスを作成

### データ検証テスト

1. テスト項目書を作成
2. Athenaでクエリ実行（SELECTのみ）
3. get-query-resultsで結果を取得
4. 期待するレコード数・値を確認
5. S3出力ファイルの存在確認
6. エビデンスを作成
