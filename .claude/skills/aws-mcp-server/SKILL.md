---
name: aws-mcp-server
description: Access AWS MCP Server (Preview) for documentation search and API calls with IAM authentication and CloudTrail logging. Use when (1) searching AWS documentation with enterprise audit requirements, (2) making read-only AWS API calls, or (3) needing IAM-based access control for AI tools.
context: fork
---

# AWS MCP Server Skill

AWSが提供するフルマネージドのリモートMCPサーバーに接続し、ドキュメント検索とAPIコールを実行するSkillです。

## Prerequisites

- AWS認証情報（MFA認証後の一時認証情報）
- Python 3.10+（uvx用）

## Setup

```bash
cd .claude/skills/aws-mcp-server
pnpm install
```

## Usage

### ドキュメント検索（AWS Knowledge機能）

```bash
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz \
  pnpm exec tsx index.ts search "Lambda concurrency" 5
```

### APIコール（AWS API機能）- 参照系のみ

```bash
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz \
  pnpm exec tsx index.ts api "aws___call_aws" '{"cli_command":"aws s3 ls"}'
```

Arguments

- `command` - 実行コマンド (search, api)
- search: `query` (検索クエリ), `limit` (結果数、デフォルト: 5)
- api: `tool_name` (AWS MCPツール名), `args` (JSON形式の引数)

## Output

### 検索結果

```json
{
  "query": "Lambda concurrency",
  "totalResults": 6,
  "topResults": [
    {
      "title": "Concurrency - AWS Lambda",
      "url": "https://docs.aws.amazon.com/lambda/latest/api/API_Concurrency.html",
      "summary": "The number of concurrent executions that are reserved..."
    }
  ]
}
```

### APIコール結果

```json
{
  "tool": "aws___call_aws",
  "success": true,
  "result": "2024-01-15 10:30:00 my-bucket\n2024-02-20 14:45:00 another-bucket..."
}
```

## Features

- IAM認証（SigV4）による細かいアクセス制御
- CloudTrailでの監査ログ
- MFA認証をセッション中に柔軟に実行可能

## AWS MCP Server Actions

IAMポリシーで以下のActionを制御可能

- `aws-mcp:InvokeMcp` - MCP全般
- `aws-mcp:CallReadOnlyTool` - 参照系ツール
- `aws-mcp:CallReadWriteTool` - 更新系ツール

## Notes

- AWS MCP Serverは現在Preview版
- 更新系APIコール（create, update, delete等）は実行しない
- MFA認証フローは aws-operations.md に従う
