# AWS操作ルール

AWS操作は必ずMCPスクリプト経由で実行する。AWS CLIの直接実行は禁止。

## 基本原則

- AWS CLIを直接実行してはいけない
- `.claude/skills/aws-mcp-server` skill経由でAWS操作を行う
- 破壊的操作はスクリプト内でブロック済み

## MFA認証フロー

MFA認証が必要な環境では、以下の順序で実行する

1. ユーザーにどのprofileを使用するか選択させる
2. `~/.aws/config`から対象profileの設定情報を取得（role_arn、source_profile、mfa_serial）
3. 1Password CLIからMFAコードを自動取得
   - `op item get "AWS" --vault Employee --otp`
4. `aws sts assume-role`で一時認証情報を取得
5. 取得した認証情報を環境変数として設定し、MCPスクリプトを実行
   - `cd .claude/skills/aws-mcp-server && env AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz pnpm exec tsx index.ts <command> <args>`
6. 一時認証情報は約1時間有効なため、同じセッション内で複数のコマンドを実行可能

### 1Password CLIが使えない場合

1Password CLIが未認証の場合は、AskUserQuestionツールでMFAコードを手動取得する

## AWS操作コマンド

```bash
# aws-mcp-serverディレクトリで実行
cd .claude/skills/aws-mcp-server && \
  env AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz \
  pnpm exec tsx index.ts <command> <args>
```

### 利用可能なコマンド

| コマンド                      | 用途                          |
| ----------------------------- | ----------------------------- |
| `tools`                       | 利用可能なMCPツール一覧       |
| `search <query> [limit]`      | AWSドキュメント検索           |
| `api <tool_name> <args_json>` | AWS API呼び出し（参照系のみ） |

### 使用例

```bash
# aws-mcp-serverディレクトリ内で実行（envと認証情報は省略）

# S3バケット一覧
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws s3 ls"}'

# Step Functions実行結果
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws stepfunctions describe-execution --execution-arn arn:aws:states:..."}'

# CloudWatch Logs
pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws logs filter-log-events --log-group-name ..."}'

# ドキュメント検索
pnpm exec tsx index.ts search "Lambda concurrency" 5
```

## 例外（AWS CLI直接実行が許可されるケース）

以下のみAWS CLI直接実行を許可

- profile一覧取得: `grep '\[profile' ~/.aws/config`
- 設定ファイル読み取り: `grep -A 10 '\[profile xxx\]' ~/.aws/config`
- 認証情報取得: `aws sts assume-role ...`

## 禁止される操作

aws-mcp-server skill内でブロック済みだが、以下は絶対に実行してはいけない

- create, delete, update, put, terminate, modify, remove
- start, stop, reboot
- attach, detach

許可されるのは参照系のみ（Describe, List, Get等）
