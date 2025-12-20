---
name: library-docs-fetch
description: Fetch library documentation via Context7 MCP with token optimization. Returns preview and metadata instead of full documentation, reducing token consumption by 90-95%.
allowed-tools:
  - Bash
  - Read
---

# Library Documentation Fetcher

Context7を使ってライブラリドキュメントを取得し、プレビューのみを返すSkillです。

## Setup

```bash
cd .claude/skills/library-docs-fetch
pnpm install
```

## Usage

```bash
pnpm exec tsx index.ts "boto3" "s3"
pnpm exec tsx index.ts "react"
pnpm exec tsx index.ts "aws-cdk" "lambda"
```

Arguments

- `library` - ライブラリ名 (必須)
- `topic` - トピック名 (オプション)

## Output

```json
{
  "library": "boto3",
  "topic": "s3",
  "sections": 8,
  "preview": "# S3 Client\n\nThe S3 client provides methods for interacting with Amazon S3...",
  "fullDocUrl": "https://context7.dev/docs/boto3"
}
```

## Token Efficiency

従来のMCP直接呼び出し vs このSkill

- 従来: 10,000-20,000トークン (完全なドキュメント)
- このSkill: 500-1,000トークン (プレビューのみ)
- 削減率: 90-95%

## How it Works

1. MCPサーバー（`context7`）に接続してライブラリIDを解決
2. ドキュメントを取得
3. 最初の300文字のプレビューとメタデータのみを返す
4. 完全なドキュメントが必要な場合はURLを提供
