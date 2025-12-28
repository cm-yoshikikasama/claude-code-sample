# AWS操作ルール

AWS操作は必ずMCPスクリプト経由で実行する。AWS CLIの直接実行は禁止。

## 基本原則

- AWS CLIを直接実行してはいけない
- `.claude/skills/aws-mcp-server` スクリプト経由でAWS操作を行う
- 破壊的操作はスクリプト内でブロック済み

## MCP経由にする理由

- トークン効率化（結果を500文字にプレビュー圧縮）
- 破壊的操作のブロックをコードで強制
- CloudTrailでの監査ログ
- エラーハンドリングの統一

## MFA認証フロー（重要）

MFA認証が必要な環境では、以下の順序で実行する（MFAコードは30秒で期限切れになるため、最後に取得すること）

1. ユーザーにどのprofileを使用するか選択させる
2. `~/.aws/config`から対象profileの設定情報を取得（role_arn、source_profile、mfa_serial）
3. AskUserQuestionツールでユーザーから現在のMFAコード（6桁）を取得
4. 即座に `aws sts assume-role` で一時認証情報を取得（MFAコード期限切れを防ぐ）
5. 取得した認証情報をインライン環境変数として設定し、MCPスクリプトを実行
   - `AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz pnpm exec tsx .claude/skills/aws-mcp-server/index.ts <command> <args>`
6. 一時認証情報は約1時間有効なため、同じセッション内で複数のコマンドを実行可能

## AWS操作コマンド

```bash
# プロジェクトルートから実行
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz \
  pnpm exec tsx .claude/skills/aws-mcp-server/index.ts <command> <args>
```

### 利用可能なコマンド

| コマンド                      | 用途                          |
| ----------------------------- | ----------------------------- |
| `tools`                       | 利用可能なMCPツール一覧       |
| `search <query> [limit]`      | AWSドキュメント検索           |
| `api <tool_name> <args_json>` | AWS API呼び出し（参照系のみ） |

### 使用例

```bash
# S3バケット一覧
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api "s3_ListBuckets" '{}'

# Step Functions実行結果
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api "stepfunctions_DescribeExecution" '{"executionArn":"..."}'

# CloudWatch Logs
pnpm exec tsx .claude/skills/aws-mcp-server/index.ts api "logs_FilterLogEvents" '{"logGroupName":"..."}'
```

## 例外（AWS CLI直接実行が許可されるケース）

以下のみAWS CLI直接実行を許可

- profile一覧取得: `grep '\[profile' ~/.aws/config`
- 設定ファイル読み取り: `grep -A 10 '\[profile xxx\]' ~/.aws/config`
- 認証情報取得: `aws sts assume-role ...`

## 禁止される操作

MCPスクリプト内でブロック済みだが、以下は絶対に実行してはいけない

- create, delete, update, put, terminate, modify, remove
- start, stop, reboot
- attach, detach

許可されるのは参照系のみ（Describe, List, Get等）
