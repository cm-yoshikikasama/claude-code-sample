# 参考資料

Claude Codeを活用するための参考資料とベストプラクティス集

## ツール

- [serena](https://github.com/serena-ai/serena)
- [context7](https://context7.com/)
- [参考設定リポジトリ](https://github.com/nokonoko1203/claude-code-settings/tree/main)

## 概念・基礎知識

### コンテキストエンジニアリング

- [AIエージェントのための効果的なコンテキストエンジニアリング](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [AIエージェントを支える技術: コンテキストエンジニアリングの現在地](https://tech.algomatic.jp/entry/2025/10/15/172110)
- [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)

## CLAUDE.md / プロジェクト指示の書き方

- [claude code templates](https://www.aitmpl.com/agents)
- [参考になるリポジトリ](https://zenn.dev/imaimai17468/articles/5df32a0bcfc75a)
- [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

## Skills

### 基礎

- [What are Skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Claude公式Skillsベストプラクティス](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)
- [skills-explained](https://www.claude.com/blog/skills-explained)
  - スキルを使うタイミング: クロードに専門的なタスクを一貫して効率的に実行させたい場合
  - 組織のワークフロー: ブランドガイドライン、コンプライアンス手順、ドキュメントテンプレート
  - 専門知識: Excel の計算式、PDF 操作、データ分析
  - 個人的な好み: メモの取り方、コーディングパターン、研究方法
  - ポイント
    - プロンプトは会話をまたいで保存されない
    - 繰り返しのワークフローや専門知識が必要な場合は、スキルやプロジェクトの指示として保存
    - 複数の会話で同じプロンプトを繰り返し入力している場合は、スキルを作成するタイミング
- [書いたコードをSkill化して再利用](https://zenn.dev/explaza/articles/9f3271d1a9ce70)
- [Claude skillでフロントエンド開発](https://claude.com/blog/improving-frontend-design-through-skills)
- [Claude Code完全ガイド](https://zenn.dev/heku/books/claude-code-guide/viewer/introduction)

### 活用例

- [ブランドガイドラインスキル](https://github.com/anthropics/skills/tree/main/brand-guidelines)
  - 会社のカラーパレット、タイポグラフィのルール、レイアウト仕様を含む

## Plugins

- [Claude Code Plugins のふんわり解説（AI・人間用）](https://dev.classmethod.jp/articles/claude-code-plugin/)
  - [Claude Code plugin公式ドキュメント](https://code.claude.com/docs/en/plugins)
  - [プラグインリファレンス](https://code.claude.com/docs/ja/plugins-reference)
  - pluginリポジトリを作ってそれを参照するような管理方式が良い（共通で使うもの）

## Subagent

- [AWS技術調査を支援するClaude Codeサブエージェントを作ってみた #コンテキストを節約しよう](https://dev.classmethod.jp/articles/claude-code-agent-aws-researcher/)
  - subagentを使うメリット
- [開発現場で使えるSubagent活用術](https://speakerdeck.com/makikub/kai-fa-xian-chang-deshi-erusubagenthuo-yong-shu)
  - plan.mdでメモを定義
  - スラッシュコマンドで、`code-review`や`create-plan`でsubagentを複数走らせる

## MCP (Model Context Protocol)

- [MCP ツールのコンテキスト圧迫の問題とその解決策](https://azukiazusa.dev/blog/mcp-tool-context-overflow/)
- [MCP によるコード実行: より効率的なエージェントの構築](https://www.anthropic.com/engineering/code-execution-with-mcp)
  - ほとんどのMCPではツール定義を事前に読み込みコンテキストを消費する

### AWS MCP Server（Preview）

AWSが提供するリモートMCPサーバー。IAM認証でAWSリソースへアクセス可能。

- [AWS MCP Servers](https://awslabs.github.io/mcp/)
- [AWS MCP Serverをプレビューとして公開しました](https://dev.classmethod.jp/articles/aws-mcp-server-preview/)
- [Claude CodeとAWS MCP ServerでCloudTrailのログが検索できないかを試してみた](https://dev.classmethod.jp/articles/claude-code-aws-mcp-server-cloudtrail/)

#### 特徴

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| 認証       | IAM認証（SigV4署名）                |
| 監査       | CloudTrailで全MCP呼び出しをログ記録 |
| リージョン | 現在 us-east-1 のみ                 |
| ステータス | Preview版（仕様変更の可能性あり）   |

#### IAMアクション（将来的な多層防御）

AWS MCP Server専用のIAMアクションでAI経由のアクセスのみを制御可能。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["aws-mcp:InvokeMcp", "aws-mcp:CallReadOnlyTool"],
      "Resource": "*"
    },
    {
      "Effect": "Deny",
      "Action": ["aws-mcp:CallReadWriteTool"],
      "Resource": "*"
    }
  ]
}
```

ただし現時点ではPreview版のため、IAMポリシーでの制御はGA後に検討。

#### 本プロジェクトでの設定

本プロジェクトではaws-mcp-server skill（`skills/aws-mcp-server/`）を使用。MFA認証をセッション中に柔軟に実行可能。

MFA認証フローの詳細は @.claude/rules/aws-operations.md を参照。

### コード実行アプローチの適用ケース

記事「Claude CodeのSkills+MCPでトークン削減」で紹介されている手法は、以下の2条件を満たすケースで効果を発揮する。

参考記事: [Claude CodeのSkills+MCPでトークン削減](https://dev.classmethod.jp/articles/claude-code-skills-mcp-token-reduction/)

#### 効果を発揮する2つの条件

1. 中間結果をモデルに通さない
   - 生データ → コード側で抽出/集計/ランキング → 縮小した結果のみClaudeに返却
   - 例: 複数PDFから特定セクションを抽出、全リージョンのリソース数を集計

2. 制御フローをモデルの外で回す
   - 複数MCP呼び出し + ループ + 条件分岐をコード内で完結
   - Claude ↔ 実行環境の往復を1回に抑える

#### 効果がないケース

- 単発のMCP呼び出し（1回のCLI呼び出しで1回のMCP呼び出し）
- 単なる文字数制限（インテリジェントな抽出/集計なしの切り詰め）
- ラップして返すだけの実装

#### 本リポジトリの方針

AWS MCP ServerはMFA認証が必要なため、aws-mcp-server skill経由でコードから実行する方式を採用。これによりセッション中に柔軟にMFA認証を行い、一時認証情報を環境変数として渡すことが可能。

一方、context7やiam-policy-autopilot等の認証不要なMCPサーバーは.mcp.jsonで直接定義している。

## Tips・実践例

- [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [Claude Code のプランモードがより正確な計画を立てられるようになっていた](https://azukiazusa.dev/blog/claude-code-plan-mode-improved/)
  - built-inの組み込みplan Subagentが導入された。計画を一時的にファイルに保存し仕様書ドリブンなplanを建てられるようになった。
    - Kiroのsddのように。

### チーム活用・コンテキスト対策

- [『Claude Codeチーム活用の現在地 〜小さな実践と今後の展望〜』というタイトルでウェビナー登壇しました](https://dev.classmethod.jp/articles/shuntaka-current-state-of-claude-code-team-adoption-small-practices-and-future-prospects/)
  - コンテキストオーバーする場合は、cliを使う（例: ghコマンド）
  - ファイル検索のベストプラクティスを確立する必要がある
  - settings.jsonは試行錯誤しやすいように共通管理しない
  - .settings.local.jsonをtemplateとして作成
  - settings.local.jsonを個々で作成してもらう
  - MCP統合は.mcp.jsonで直接定義（プロジェクトルートで一元管理）
