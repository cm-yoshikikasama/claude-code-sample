# claude-code-sample

AWS CDK (TypeScript) + Python Lambdaプロジェクト。Claude Codeベストプラクティスと実装サンプルを含みます。

## プロジェクト概要

このリポジトリは、Claude Codeを使用したAWS開発のベストプラクティスを示すサンプルプロジェクトです。

- AWS CDK (TypeScript) によるインフラコード管理
- Python Lambda関数の実装
- Subagent、Skills、Rulesを活用した開発フロー
- セキュリティベストプラクティスの適用

## プロジェクト構造

```text
.
├── .claude/                       # Claude Code設定
│   ├── agents/                    # Subagent定義
│   ├── rules/                     # プロジェクトルール
│   ├── skills/                    # スキル定義
│   └── hooks/                     # フック設定
├── docs/                          # 参考資料（添付ファイル、通常参照不要）
├── sample_*/                      # サンプルプロジェクト
│   ├── cdk/                       # CDKインフラコード (TypeScript)
│   │   ├── lib/                   # Stack定義
│   │   ├── bin/                   # CDK app entry point
│   │   └── package.json
│   ├── resources/                 # Pythonコード（Lambda、Glue等）
│   └── sql/                       # SQLスクリプト（必要に応じて）
├── CLAUDE.md                      # プロジェクト指示（主要ガイドライン）
└── README.md                      # このファイル
```

## 前提条件

- Node.js 18+
- Python 3.13+
- AWS CLI設定済み
- pnpm

## サンプルプロジェクト

### sample_duckdb_iceberg_lambda_py

Lambda + DuckDB + Iceberg統合。S3上のIcebergテーブルをクエリします。

詳細: [sample_duckdb_iceberg_lambda_py/README.md](sample_duckdb_iceberg_lambda_py/README.md)

## セットアップ

### CDK

```bash
cd sample_duckdb_iceberg_lambda_py/cdk  # または sample_sfn_athena/cdk
pnpm install
pnpm run build
```

### Lambda

```bash
cd sample_duckdb_iceberg_lambda_py/resources/lambda
pip install -r requirements.txt
```

## デプロイ

```bash
cd sample_duckdb_iceberg_lambda_py/cdk  # または sample_sfn_athena/cdk
pnpm run cdk diff      # 変更確認
pnpm run cdk deploy    # デプロイ
```

## Claude Code 5機能の使い分け

本プロジェクトでは、Claude Codeの5つの主要機能を効果的に組み合わせています。

### 機能比較表

| 機能 | 実行方式 | トリガー | 主な用途 | ファイル構造 |
| --- | --- | --- | --- | --- |
| Subagents | モデル駆動 | AI自動判断 or 明示呼び出し | 複雑な専門タスク（独立コンテキスト） | `.claude/agents/*.md` |
| Skills | モデル駆動 | AI自動発見 | 実装パターン・テンプレート提供 | `.claude/skills/*/` |
| Slash Commands | ユーザー駆動 | `/command` 入力 | 頻繁な手動操作、クイックプロンプト | `.claude/commands/*.md` |
| Hooks | イベント駆動 | ツール実行時自動 | 強制的なルール（フォーマット、保護） | `.claude/hooks/` + `settings.json` |
| Rules | 自動ロード | ファイル編集時 | プロジェクト規約・ガイドライン | `.claude/rules/*.md` |

### 各機能の概要

#### Rules - 基本規約の自動ロード

プロジェクト固有の開発ガイドラインを定義します。paths frontmatterで条件付きロードが可能です。

- セッション開始時に自動ロード（paths指定なし）
- ファイル編集時に条件付きロード（paths指定あり）
- チーム全体で守るべき規約を明示

#### Skills - 実装パターン提供

Claudeが自動的に発見・使用する実装パターン集です。

- ユーザーの要求内容に基づいてClaude自動発見
- 複数ファイル構成で詳細な実装例を提供
- descriptionフィールドのキーワードで発見されやすくする

#### Subagents - 専門的判断

特定領域に特化したAIアシスタントです。独立したコンテキストウィンドウを持ちます。

- 長時間の独立した作業に最適
- Skillsを明示的に参照可能（skills frontmatter）
- メインコンテキストの圧迫を回避

#### Hooks - 自動実行による品質保証

ツール実行やセッションイベント時に自動実行されるシェルコマンドです。

- 決定的な制御（LLM判断に頼らない）
- フォーマッタやリンターを強制実行
- SubagentStop時の自動レビュー促進

#### Slash Commands - 手動操作の効率化

ユーザーが明示的に呼び出す頻繁に使うプロンプトです。

- `/command` で即座に実行
- 引数を受け取り可能
- allowed-toolsで権限制限

### 本プロジェクトでの実装

#### Rules（5個）

```text
.claude/rules/
├── cdk.md        (paths: "**/cdk/**/*.ts")  - CDK TypeScript編集時のみ
├── python.md     (paths: "**/*.py")         - Python編集時のみ
├── aws-cli.md    (paths なし)               - 常時ロード
├── workflow.md   (paths なし)               - 常時ロード
└── markdown.md   (paths なし)               - 常時ロード
```

動作例（CDK TypeScript編集時）

- cdk.md: any型禁止、pnpm使用、ハードコード禁止
- aws-cli.md: MFA認証フロー、profile明示指定
- workflow.md: Subagent選択基準

#### Skills（4個）

```text
.claude/skills/
├── writing-python-lambdas/    - Python Lambda実装パターン
├── building-aws-cdk/          - CDK実装パターン
├── checking-aws-security/     - セキュリティチェックリスト
└── creating-aws-diagrams/     - AWS図作成（Mermaid）
```

動作例: ユーザーが「Lambda関数を実装して」と言うと、Claudeが自動的に writing-python-lambdas を発見し、実装パターンに従ってコードを生成します。

#### Subagents（5個）

```text
.claude/agents/
├── reviewer.md            - コードレビュー（skills: 3個参照）
├── design-doc-writer.md   - 設計書作成
├── tester.md             - テスト実行
├── docs-researcher.md    - ドキュメント調査
└── implementer.md        - 実装
```

重要な実装: reviewer は `skills: building-aws-cdk, writing-python-lambdas, checking-aws-security` で複数Skillsを参照し、専門知識を活用します。

#### Hooks（4個のイベント）

settings.json より

- PostToolUse: Write/Edit後に format-all.sh を自動実行（Biome, Ruff, Prettier等）
- SubagentStop: Subagent完了後にメインClaudeへ自動レビュー指示
- Notification/Stop: Funk.aiff音声通知

format-all.sh は以下を自動実行

- TypeScript/JSON: Biome
- Python: Ruff
- SQL: SQLFluff
- YAML: Prettier + yamllint
- Markdown: Prettier + markdownlint

#### Slash Commands（1個）

```text
.claude/commands/commit-msg.md
```

使用例: `/commit-msg` と入力すると、git status/diff/logを確認し、適切なコミットメッセージと実行可能なコマンドを生成します。settings.jsonで git 操作を禁止しているため、コマンドを出力するのみでユーザーが手動実行します。

### 連携フロー実例

Lambda関数実装の典型的なワークフロー

```text
ユーザー: 「DuckDB + Iceberg連携のLambda関数を実装して」

1. Rules 自動ロード
   - python.md: 型ヒント必須、boto3グローバル初期化
   - workflow.md: Subagent選択基準

2. Subagent 起動判断
   - workflow.md より implementer を選択

3. Implementer Subagent が起動
   - writing-python-lambdas Skill を参照
   - 実装パターンに従いコード生成
   - Rules 規約を守る

4. Hooks 自動実行（PostToolUse）
   - format-all.sh が起動
   - Ruff で自動フォーマット

5. Hooks 自動実行（SubagentStop）
   - メインClaudeにレビュー指示

6. Reviewer Subagent 起動
   - skills: writing-python-lambdas, checking-aws-security 参照
   - git diff で変更確認
   - レビューコメント生成

結果: 品質の高いコード（Rules準拠、Skills適用、Subagentsレビュー済み、Hooks自動フォーマット済み）
```

## 詳細ガイドライン

プロジェクトの詳細ルールは以下を参照

- 主要ガイドライン: CLAUDE.md
- AWS CDK (TypeScript): .claude/rules/cdk.md
- Python Lambda: .claude/rules/python.md
- 全般ガイドライン: .claude/rules/general.md
- 開発フロー（Subagent活用）: .claude/rules/workflow.md
- Markdown編集ルール: .claude/rules/markdown.md

## 参考資料

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
  - スキルを使うタイミング：クロードに専門的なタスクを一貫して効率的に実行させたい場合
  - 組織のワークフロー: ブランドガイドライン、コンプライアンス手順、ドキュメントテンプレート
  - 専門知識: Excel の計算式、PDF 操作、データ分析
  - 個人的な好み: メモの取り方、コーディングパターン、研究方法
  - ポイント:
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

## Custom Slash Commands

- 現在、Skillsとの違いを検証中（詳細は検討事項・TODOセクションを参照）

## Tips・実践例

- [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [Claude Code のプランモードがより正確な計画を立てられるようになっていた](https://azukiazusa.dev/blog/claude-code-plan-mode-improved/)
  - built-inの組み込みplan Subagentが導入された。計画を一時的にファイルに保存し仕様書ドリブンなplanを建てられるようになった。
    - Kiroのsddのように。

### 振り返り機能

- [claude codeに自ら振り返りをさせる](https://zenn.dev/appbrew/articles/7eb12fff5738f4)
- [振り返りのタイミングをhooksで管理](https://zenn.dev/appbrew/articles/e2f38677f6a0ce)

### チーム活用・コンテキスト対策

- [『Claude Codeチーム活用の現在地 〜小さな実践と今後の展望〜』というタイトルでウェビナー登壇しました](https://dev.classmethod.jp/articles/shuntaka-current-state-of-claude-code-team-adoption-small-practices-and-future-prospects/)
  - コンテキストオーバーする場合は、cliを使う（例: ghコマンド）
  - ファイル検索のベストプラクティスを確立する必要がある
  - settings.jsonは試行錯誤しやすいように共通管理しない
  - .settings.local.jsonをtemplateとして作成
  - settings.local.jsonを個々で作成してもらう
  - .mcp.jsonも個々で設定しやすいようにtemplateだけとする
