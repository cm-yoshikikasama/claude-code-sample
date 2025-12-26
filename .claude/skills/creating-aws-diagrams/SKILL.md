---
name: creating-aws-diagrams
description: Creates AWS architecture diagrams using Mermaid flowchart with official AWS icons, clickable nodes, and proper layout. Use when creating or updating AWS infrastructure diagrams, visualizing CDK stacks, or documenting system architecture.
---

# AWS構成図作成（Mermaid）

MermaidでAWS構成図を作成するためのガイドライン

## 基本パターン

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

## References

[mermaid-guide.md](mermaid-guide.md) - レイアウト設計、スタイル定義
