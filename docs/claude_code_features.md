# Claude Code 6機能の使い分け

本プロジェクトでは、Claude Codeの6つの主要機能を効果的に組み合わせています。

## 機能比較表

| 機能 | 実行方式 | トリガー | 主な用途 | ファイル構造 |
| --- | --- | --- | --- | --- |
| MCP | ツール呼び出し | AI判断 or 明示呼び出し | 外部ツール連携（API、図生成等） | `.mcp.json` |
| Subagents | モデル駆動 | AI自動判断 or 明示呼び出し | 複雑な専門タスク（独立コンテキスト） | `.claude/agents/*.md` |
| Skills | モデル駆動 | AI自動発見 or `/skill` 入力 | 実装パターン・テンプレート提供 | `.claude/skills/*/` |
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

## MCP (Model Context Protocol)

外部ツールを呼び出すためのプロトコル。`.mcp.json` で定義します。

### 本プロジェクトのMCP構成

```text
.mcp.json
├── context7              - ライブラリドキュメント取得
├── iam-policy-autopilot  - IAMポリシー生成
└── aws-diagram-mcp-server - AWS図表生成（Python diagrams）
```

| MCP名 | 用途 | 使用例 |
| --- | --- | --- |
| context7 | ライブラリの最新ドキュメント取得 | 「boto3の最新APIを調べて」 |
| iam-policy-autopilot | ソースコードからIAMポリシー生成 | 「このLambdaに必要な権限を生成して」 |
| aws-diagram-mcp-server | Python diagramsでAWS構成図生成 | 「アーキテクチャ図をPNGで出力して」 |

### トークン最適化設定

`.claude/settings.json` で以下を設定することで、MCPツールを動的ロードしてトークン消費を削減できます。

```json
{
  "env": {
    "ENABLE_TOOL_SEARCH": "true",
    "ENABLE_EXPERIMENTAL_MCP_CLI": "false"
  }
}
```

この設定により、MCPツール定義が事前にコンテキストに読み込まれず、必要時のみ動的にロードされます。

## Skill vs MCP の使い分け

本プロジェクトではSkillとMCPを明確に使い分けています。

### 役割の違い

| 観点 | Skill | MCP |
| --- | --- | --- |
| 役割 | ワークフロー・手順・ガイドライン | ツール呼び出し |
| 内容 | 「どうやるか」「いつ使うか」 | 「何ができるか」 |
| 形式 | Markdownドキュメント | 構造化されたAPI |
| 読み込み | System Promptに常駐 | 動的ロード可能（ENABLE_TOOL_SEARCH） |

### 選択基準

| ユースケース             | 選択  | 理由                         |
| ------------------------ | ----- | ---------------------------- |
| 実装パターンを教えたい   | Skill | 手順・チェックリストが必要   |
| 外部APIを呼び出したい    | MCP   | ツールとして機能提供         |
| 認証フロー等の手順が複雑 | Skill | 人間が読める手順書として価値 |
| 単純なツール呼び出し     | MCP   | 構造化されたインターフェース |

### 本プロジェクトでの具体例

#### Skillが適切なケース

| Skill                   | 理由                                    |
| ----------------------- | --------------------------------------- |
| writing-python-lambdas  | 実装手順・チェックリストを提供          |
| building-aws-cdk        | 実装パターン・命名規則を提供            |
| checking-aws-security   | レビューワークフローを提供              |
| aws-mcp-server          | MFA認証フロー・スクリプト実行手順を提供 |
| aws-integration-testing | テストフロー・エビデンス作成手順を提供  |

#### MCPが適切なケース

| MCP                    | 理由                               |
| ---------------------- | ---------------------------------- |
| context7               | ドキュメント取得という単純なツール |
| iam-policy-autopilot   | ポリシー生成という単純なツール     |
| aws-diagram-mcp-server | 図生成という単純なツール           |

#### 類似機能の使い分け

AWS構成図作成には2つの方法があります。

| 方法 | 実装 | 出力形式 | 使いどころ |
| --- | --- | --- | --- |
| creating-aws-diagrams (Skill) | Mermaid記法 | テキスト（Markdown埋め込み） | 設計書に埋め込み、テキストで編集したい |
| aws-diagram-mcp-server (MCP) | Python diagrams | PNG画像 | GitHubでアイコン表示、画像として出力したい |

workflow.md で選択基準を定義

```text
- Markdown内に埋め込み、テキストで編集したい → Mermaid (Skill)
- GitHubでアイコン表示、画像として出力したい → Diagram MCP
- 指定がなければデフォルトはMermaid
```
