---
name: creating-aws-diagrams
description: MUST use this skill when user requests Mermaid diagrams, AWS diagrams, architecture diagrams, 構成図, or アーキテクチャ図. Creates diagrams using Mermaid (with Iconify AWS icons) or Diagram MCP (PNG output). 
---

# AWS構成図作成

AWS構成図を作成するための2つの方式

## 最初に方式を選択

ユーザーの指示から方式を判断する

| ユーザーの指示例 | 選択する方式 |
| --- | --- |
| 「構成図を書いて」「README.mdに追加して」「Markdownで」 | Mermaid |
| 「画像で作成して」「PNGで生成して」「構成図を画像出力」 | Diagram MCP |
| 明確な指定なし | AskUserQuestionで確認 |

### 判断できない場合

AskUserQuestionツールで確認する

- question: どちらの形式で構成図を作成しますか?
- header: 図の形式
- options:
  - Mermaid（Markdown埋め込み、テキスト編集向け）
  - Diagram MCP（PNG画像出力、AWSアイコン確実表示）

## 方式の比較

| 方式 | 用途 | メリット |
| --- | --- | --- |
| Mermaid | Markdown埋め込み、テキスト編集 | バージョン管理しやすい、編集が容易 |
| Diagram MCP | GitHub表示、画像出力 | AWSアイコン確実に表示、レイアウト安定 |

## Mermaid

AWS公式アイコンを使用（Iconify API）

```mermaid
flowchart LR
lambda@{img: "https://api.iconify.design/logos/aws-lambda.svg",label: "lambda:<br>function-name",pos: "b",w: 60,h: 60,constraint: "on"}
```

ノードID規則

| サービス | ノードID           |
| -------- | ------------------ |
| Lambda   | function-name      |
| S3       | bucket-name        |
| ELB      | load-balancer-name |
| EC2      | instance-id        |
| ECS      | cluster/service    |
| RDS      | db-cluster-id      |

詳細: [guides/mermaid-guide.md](guides/mermaid-guide.md)

## Diagram MCP

Python diagramsパッケージでPNG画像を生成

```python
with Diagram("タイトル", show=False, direction="LR"):
    s3 = S3("Source")
    glue = Glue("ETL")
    athena = Athena("Query")
    s3 >> glue >> athena
```

レイアウトのポイント

- Clusterのネストは2階層以内
- メインフローは単一チェーン接続
- IAMロールは関連Cluster内に配置

詳細: [guides/diagram-mcp-guide.md](guides/diagram-mcp-guide.md)
