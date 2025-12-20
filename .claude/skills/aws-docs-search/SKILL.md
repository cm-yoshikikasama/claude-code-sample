---
name: aws-docs-search
description: Search AWS documentation via MCP with token optimization. Returns only top results with summaries instead of full documents, reducing token consumption by 80-90%.
allowed-tools:
  - Bash
  - Read
---

# AWS Documentation Search

AWS公式ドキュメントを検索し、上位結果のみをコンパクトな形式で返すSkillです。

## Setup

```bash
cd .claude/skills/aws-docs-search
pnpm install
```

## Usage

```bash
pnpm exec tsx index.ts "Lambda concurrency" 5
```

Arguments

- `query` - 検索クエリ (必須)
- `limit` - 返す結果の最大数 (オプション、デフォルト: 5)

## Output

```json
{
  "query": "Lambda concurrency",
  "totalResults": 6,
  "topResults": [
    {
      "title": "Concurrency - AWS Lambda",
      "url": "https://docs.aws.amazon.com/lambda/latest/api/API_Concurrency.html",
      "summary": "The number of concurrent executions that are reserved for this function..."
    }
  ]
}
```

## Token Efficiency

従来のMCP直接呼び出し vs このSkill

- 従来: 5,000-10,000トークン (全ドキュメント)
- このSkill: 500-1,000トークン (要約のみ)
- 削減率: 80-90%

## How it Works

1. MCPサーバー（`awslabs.aws-documentation-mcp-server`）に接続してドキュメント検索を実行
2. 結果から上位N件を抽出し、要約を150文字に制限
3. JSON形式でコンパクトな結果を返す
