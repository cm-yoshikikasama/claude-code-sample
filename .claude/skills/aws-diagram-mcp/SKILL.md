---
name: aws-diagram-mcp
description: Generate AWS architecture diagrams as PNG images via MCP. Uses Python diagrams package with official AWS icons. Use when (1) PNG output is required for documentation, (2) GitHub README display with proper icons, (3) presentation materials, or (4) high-quality architecture visualization. Requires GraphViz installed.
---

# AWS Diagram MCP

AWS構成図をPNG画像として生成するSkillです。Pythonのdiagramsパッケージと公式AWSアイコンを使用します。

## Prerequisites

- Python 3.10+
- GraphViz

```bash
# macOS
brew install graphviz

# Ubuntu
sudo apt install graphviz
```

## Setup

```bash
cd .claude/skills/aws-diagram-mcp
pnpm install
```

## Usage

### ダイアグラム生成

```bash
pnpm exec tsx index.ts generate "
from diagrams import Diagram
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb

with Diagram('Serverless App', show=False, filename='architecture'):
    Lambda('Function') >> Dynamodb('Table')
" ./output
```

Arguments

- `command` - 実行コマンド (generate, list-icons, examples)
- `code` - Pythonコード (generateの場合)
- `output_dir` - 出力ディレクトリ (generateの場合)

### アイコン一覧取得

```bash
pnpm exec tsx index.ts list-icons compute
```

### 例の取得

```bash
pnpm exec tsx index.ts examples
```

## Output

生成されたPNG画像は指定ディレクトリに保存されます。

推奨保存先: `(プロジェクト)/docs/images/`

## Mermaid方式との比較

| 項目         | Diagram MCP        | Mermaid                |
| ------------ | ------------------ | ---------------------- |
| 出力形式     | PNG画像            | Markdownコードブロック |
| GitHub表示   | アイコン表示可能   | アイコン非表示         |
| クリック機能 | なし               | マネコン遷移可能       |
| 編集         | コード再実行が必要 | テキスト編集で即反映   |
| 環境依存     | GraphViz必要       | なし                   |

## How it Works

1. MCPサーバー（`awslabs.aws-diagram-mcp-server`）に接続
2. Pythonコードを受け取り、diagramsパッケージで図を生成
3. PNG画像を指定ディレクトリに出力
