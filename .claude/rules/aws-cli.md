# AWS CLI

- AWS CLIを使用する際は必ずprofileを明示指定する

## MFA認証フロー（重要）

MFA認証が必要な環境では、以下の順序で実行する（MFAコードは30秒で期限切れになるため、最後に取得すること）

1. ユーザーにどのprofileを使用するか選択させる
2. `~/.aws/config`から対象profileの設定情報を取得（role_arn、source_profile、mfa_serial）
3. AskUserQuestionツールでユーザーから現在のMFAコード（6桁）を取得
4. 即座に `aws sts assume-role` で一時認証情報を取得（MFAコード期限切れを防ぐ）
5. 取得した認証情報をインライン環境変数として設定し、AWS CLIコマンドを実行
   - `AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz aws s3 ls`
6. 一時認証情報は約1時間有効なため、同じセッション内で複数のコマンドを実行可能（その都度インライン環境変数を指定）

## 重要な注意事項

- AWS CLIコマンドを実行する際は、必ず上記のMFA認証フローを経由すること
- `--profile`オプションを直接使用してはいけない（MFA認証なしでの実行を防ぐため）
- MFA認証フローで取得した一時認証情報をインライン環境変数として指定してAWS CLIコマンドを実行
- 例外：profile一覧取得、設定ファイル読み取り、sts assume-roleは直接実行可能

## ユーザー承認

AWS CLIコマンド（インライン環境変数使用）はsettings.jsonのallow listに含まれないため、実行時にユーザー承認が必要。これは意図的な設計であり、本番環境への誤操作を防ぐための安全策。

## 禁止コマンド

参照専用のため、破壊的操作は絶対に実行してはいけない。

- 禁止される操作：
  - delete、create、update、put、terminate、modify
  - rm、cp、mv、sync
  - attach、detach

許可されるのは参照系コマンドのみ（list、describe、get、show等）

重要：インライン環境変数を使用する場合でも、上記の破壊的操作は実行してはいけない
