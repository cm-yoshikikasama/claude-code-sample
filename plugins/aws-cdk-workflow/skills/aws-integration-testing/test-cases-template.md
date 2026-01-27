# 結合テストテンプレート

ユーザーがjob実行（Step Functions、Glue、Lambda、EventBridge等）した後、aws-mcp-server skillで結果を取得してエビデンスを記録する。

このテンプレートをコピーして `(プロジェクト)/docs/test-evidence.md` に保存

## ヘッダー情報

```text
# 結合テストエビデンス

プロジェクト: （プロジェクト名）
環境: dev / stg / prod
リージョン: ap-northeast-1
```

## テストケース一覧

列はプロジェクトに応じて調整する

| No | テストケース名 | 分類 | 試験概要 | 前提条件 | 入力データ | 期待結果 | 処理時間 | 結果 | 日付 | 担当者 | 備考 | 再実行結果 | 日付 | 担当者 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | （テスト名） | 正常系 | （概要） | （前提） | （入力） | （期待結果） | X分 | OK | YYYY/MM/DD | （担当） | - | - | - | - |
| 2 | （テスト名） | 正常系 | （概要） | （前提） | （入力） | （期待結果） | X分 | OK | YYYY/MM/DD | （担当） | - | - | - | - |
| 3 | （テスト名） | 異常系 | （概要） | （前提） | （入力） | （期待結果） | - | OK | YYYY/MM/DD | （担当） | - | - | - | - |

### テストケース記載例

複数ジョブがある場合の列追加例（sample-etl-pipeline想定）

| No | テストケース名 | 分類 | 試験概要 | 前提条件 | 入力データ | 期待結果 | main-sfn | data-export-sfn | data-transform-sfn | 結果 | 日付 | 担当者 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | sample-etl-pipeline schedule execution | 正常系 | sample-dev-etl-main-workflowをEventBridge Schedulerでスケジュール起動。データがS3に格納され、該当S3Pathにparquetファイルのみ格納されること。 | EventBridge Schedulerでスケジュール設定済み | 実行時のDB全件データ | main-sfnが正常終了、実行時間40分以内。data-export-sfnが正常終了、実行時間20分以内。data-transform-sfnが正常終了。テーブル件数一致、差分なし。 | 14分 | 12分 | 2分 | OK | 2025/01/15 | Alice | - |
| 2 | sample-etl-pipeline manual execution | 正常系 | sample-dev-etl-main-workflowを引数指定で手動実行。{"time": "2025-01-15T04:35:00Z"} | No.1の後に手動実行 | 実行時のDB全件データ | main-sfnが正常終了。テーブル件数一致。 | 14分 | 12分 | 2分 | OK | 2025/01/15 | Alice | - |
| 3 | DataTransformFunction failure notification | 異常系 | DataTransformFunctionが実行失敗する状態で起動し、SNS経由でエラー通知が発報されること。 | 一時的に無効な文字列をSQLに追加 | 実行時のDB全件データ | main-sfnが失敗終了。data-transform-sfnが失敗終了。CloudWatch alarm経由でSNS発報、Slack受信。 | - | - | - | OK | 2025/01/15 | Alice | - |

---

## No.1 エビデンス詳細

### No.1 前提条件

- （前提条件1）
- （前提条件2）

### No.1 実行結果

期待結果ごとにエビデンスを記載

#### 期待結果1

- （期待結果の内容）

処理時間: XX分

```text
# aws-mcp-server skillで実行
$ pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws <service> <command> --args..."}'
（出力結果）
```

#### データ検証（該当する場合）

検証内容に応じてクエリを記載

##### 件数確認

```sql
SELECT COUNT(*) FROM db_name.table_name
```

| count |
| ----- |
| 12345 |

##### 2テーブル間の差分比較

2つのテーブルの件数一致とデータ差分を確認する場合

件数比較

```sql
SELECT 'table_a', COUNT(*) FROM db_name.table_a
UNION ALL
SELECT 'table_b', COUNT(*) FROM db_name.table_b
```

| table   | count |
| ------- | ----- |
| table_a | 12345 |
| table_b | 12345 |

差分確認（EXCEPT句で双方向の差分を検出）

```sql
SELECT 'a_only' as difference_type, *
FROM db_name.table_a
EXCEPT
SELECT 'a_only', *
FROM db_name.table_b

UNION ALL

SELECT 'b_only' as difference_type, *
FROM db_name.table_b
EXCEPT
SELECT 'b_only', *
FROM db_name.table_a
```

結果: 差分なし

---

## No.2 エビデンス詳細

### No.2 前提条件

- （前提条件）

### No.2 ユーザー実行操作

（手動実行の場合、実行方法を記載）

### No.2 実行結果

（エビデンスを記載）

---

## No.3 エビデンス詳細（異常系）

### No.3 前提条件

- （異常を発生させる条件）

### No.3 実行結果

#### No.3 ジョブ実行結果（失敗）

- ジョブが失敗となり終了すること

```text
# aws-mcp-server skillで実行
$ pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws stepfunctions describe-execution --execution-arn ..."}'
（失敗結果）
```

#### No.3 エラー通知

- エラー通知が発報されること

- SNS発報確認: 確認済み
- Chatbot受信: 確認済み

---

## 使用方法

1. このテンプレートをコピーして `docs/test-evidence.md` に保存
2. プロジェクトに応じてテストケース一覧の列を調整
3. 各テストケースのエビデンス詳細セクションを作成
4. ユーザーがjob実行後、参照系コマンドで結果を取得して記録
5. データ検証はAthenaクエリ結果を表形式で記載
