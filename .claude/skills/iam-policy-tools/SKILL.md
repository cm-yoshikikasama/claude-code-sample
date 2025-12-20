---
name: iam-policy-tools
description: Generate IAM policies from source code or fix AccessDenied errors via MCP. Returns policy previews instead of full analysis, reducing token consumption by 85-90%.
allowed-tools:
  - Bash
  - Read
---

# IAM Policy Tools

ソースコードからIAMポリシーを生成、またはAccessDeniedエラーを修正するポリシーを生成するSkillです。

## Setup

```bash
cd .claude/skills/iam-policy-tools
pnpm install
```

## Usage

### Generate policies from source code

```bash
pnpm exec tsx index.ts generate ./path/to/handler.py
pnpm exec tsx index.ts generate ./lambda/*.py
```

### Fix AccessDenied errors

```bash
pnpm exec tsx index.ts fix-denied "AccessDenied: s3:GetObject on resource: arn:aws:s3:::my-bucket/*"
pnpm exec tsx index.ts fix-denied "AccessDenied: dynamodb:PutItem" "Lambda function"
```

## Output

```json
{
  "action": "generate_policies",
  "summary": "Generated IAM policies for 1 file(s)",
  "policyPreview": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",..."
}
```

## How it Works

1. ソースファイルの絶対パスをMCPサーバー（`iam-policy-autopilot`）に渡す
2. MCPサーバーがファイルを読み込み、IAMポリシーを生成
3. 結果から最初の500文字のプレビューを抽出して返す
