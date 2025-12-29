# Claude Code 5機能の使い分け

本プロジェクトでは、Claude Codeの5つの主要機能を効果的に組み合わせています。

## 機能比較表

| 機能 | 実行方式 | トリガー | 主な用途 | ファイル構造 |
| --- | --- | --- | --- | --- |
| Subagents | モデル駆動 | AI自動判断 or 明示呼び出し | 複雑な専門タスク（独立コンテキスト） | `.claude/agents/*.md` |
| Skills | モデル駆動 | AI自動発見 | 実装パターン・テンプレート提供 | `.claude/skills/*/` |
| Slash Commands | ユーザー駆動 | `/command` 入力 | 頻繁な手動操作、クイックプロンプト | `.claude/commands/*.md` |
| Hooks | イベント駆動 | ツール実行時自動 | 強制的なルール（フォーマット、保護） | `.claude/hooks/` + `settings.json` |
| Rules | 自動ロード | ファイル編集時 | プロジェクト規約・ガイドライン | `.claude/rules/*.md` |

## 各機能の概要

### Rules - 基本規約の自動ロード

プロジェクト固有の開発ガイドラインを定義します。paths frontmatterで条件付きロードが可能です。

- セッション開始時に自動ロード（paths指定なし）
- ファイル編集時に条件付きロード（paths指定あり）
- チーム全体で守るべき規約を明示

### Skills - 実装パターン提供

Claudeが自動的に発見・使用する実装パターン集です。

- ユーザーの要求内容に基づいてClaude自動発見
- 複数ファイル構成で詳細な実装例を提供
- descriptionフィールドのキーワードで発見されやすくする

### Subagents - 専門的判断

特定領域に特化したAIアシスタントです。独立したコンテキストウィンドウを持ちます。

- 長時間の独立した作業に最適
- Skillsを明示的に参照可能（skills frontmatter）
- メインコンテキストの圧迫を回避

### Hooks - 自動実行による品質保証

ツール実行やセッションイベント時に自動実行されるシェルコマンドです。

- 決定的な制御（LLM判断に頼らない）
- フォーマッタやリンターを強制実行
- SubagentStop時の自動レビュー促進

### Slash Commands - 手動操作の効率化

ユーザーが明示的に呼び出す頻繁に使うプロンプトです。

- `/command` で即座に実行
- 引数を受け取り可能
- allowed-toolsで権限制限

## 本プロジェクトでの実装

### Rules（5個）

```text
.claude/rules/
├── cdk.md        (paths: "**/cdk/**/*.ts")  - CDK TypeScript編集時のみ
├── python.md     (paths: "**/*.py")         - Python編集時のみ
├── aws-operations.md (paths なし)           - 常時ロード
├── workflow.md   (paths なし)               - 常時ロード
└── markdown.md   (paths なし)               - 常時ロード
```

動作例（CDK TypeScript編集時）

- cdk.md: any型禁止、pnpm使用、ハードコード禁止
- aws-operations.md: MFA認証フロー、MCP経由でのAWS操作
- workflow.md: Subagent選択基準

### Skills（4個）

```text
.claude/skills/
├── writing-python-lambdas/    - Python Lambda実装パターン
├── building-aws-cdk/          - CDK実装パターン
├── checking-aws-security/     - セキュリティチェックリスト
└── creating-aws-diagrams/     - AWS図作成（Mermaid）
```

動作例: ユーザーが「Lambda関数を実装して」と言うと、Claudeが自動的に writing-python-lambdas を発見し、実装パターンに従ってコードを生成します。

### Subagents（5個）

```text
.claude/agents/
├── reviewer.md            - コードレビュー（skills: 3個参照）
├── design-doc-writer.md   - 設計書作成
├── tester.md             - テスト実行
├── docs-researcher.md    - ドキュメント調査
└── implementer.md        - 実装
```

重要な実装: reviewer は `skills: building-aws-cdk, writing-python-lambdas, checking-aws-security` で複数Skillsを参照し、専門知識を活用します。

### Hooks（4個のイベント）

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

### Slash Commands（1個）

```text
.claude/commands/commit-msg.md
```

使用例: `/commit-msg` と入力すると、git status/diff/logを確認し、適切なコミットメッセージと実行可能なコマンドを生成します。settings.jsonで git 操作を禁止しているため、コマンドを出力するのみでユーザーが手動実行します。

## 連携フロー実例

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
