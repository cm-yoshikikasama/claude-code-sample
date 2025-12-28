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

このリポジトリを使用するには、以下のツールが必要です。

### 必須ツール

- Node.js 18+ (pnpm、CDK用)
- Python 3.13+ (Lambda開発用)
- pnpm (パッケージマネージャー)
- AWS CLI (AWS操作用)
- AWS CDK CLI (インフラコード管理用)
- Claude Code CLI (AIアシスタント)
- Git (バージョン管理)

### オプションツール

- 1Password CLI (MFA自動取得用)
  - MFA認証コードの自動取得に使用
  - 未インストールの場合は手動でMFAコードを入力

### インストール手順

#### macOS

Homebrewを使用してインストールします。

```bash
# Homebrew (未インストールの場合)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js
brew install node@18

# Python 3.13
brew install python@3.13

# pnpm (Homebrewまたはcurlでインストール)
brew install pnpm
# または
# curl -fsSL https://get.pnpm.io/install.sh | sh -

# AWS CLI
brew install awscli

# AWS CDK CLI
pnpm add -g aws-cdk

# Claude Code CLI
brew install claude-code

# Git (通常はプリインストール済み)
brew install git

# 1Password CLI (オプション、MFA自動取得用)
brew install --cask 1password-cli
```

#### Windows

各ツールの公式インストーラーを使用します。

```powershell
# Node.js
# https://nodejs.org/en/download からインストーラーをダウンロード

# Python 3.13
# https://www.python.org/downloads からインストーラーをダウンロード

# pnpm (PowerShellで実行)
iwr https://get.pnpm.io/install.ps1 -useb | iex
# または Scoopを使用
# scoop install nodejs
# scoop install pnpm

# AWS CLI
# https://aws.amazon.com/cli からインストーラーをダウンロード

# AWS CDK CLI
pnpm add -g aws-cdk

# Claude Code CLI
# https://claude.com/download からインストーラーをダウンロード

# Git
# https://git-scm.com/download/win からインストーラーをダウンロード

# 1Password CLI (オプション、MFA自動取得用)
# https://developer.1password.com/docs/cli/get-started からダウンロード
# または winget install 1Password.CLI
```

### AWS CLI設定

AWS CLIの認証情報とMFA設定を行います。

```bash
# AWS認証情報の設定
aws configure --profile <profile-name>
# AWS Access Key ID: (入力)
# AWS Secret Access Key: (入力)
# Default region name: ap-northeast-1
# Default output format: json

# MFA設定 (~/.aws/config に追記)
# [profile <profile-name>]
# region = ap-northeast-1
# role_arn = arn:aws:iam::<account-id>:role/<role-name>
# source_profile = <source-profile>
# mfa_serial = arn:aws:iam::<account-id>:mfa/<user-name>
```

### 1PasswordでのMFA管理

本プロジェクトでは、AWS MFA認証コードを1Passwordで管理することを推奨しています。Claude Codeが`op` CLIを使用してMFAコードを自動取得し、`aws sts assume-role`で一時認証情報を取得します。

#### 1Passwordへのワンタイムパスワード登録

1. 1Passwordで「AWS」という名前のアイテムを作成（Vault: Employee）
2. ワンタイムパスワード（TOTP）フィールドを追加
3. AWS IAMのMFA設定からシークレットキーを登録

#### 1Password CLI認証

```bash
# 1Password CLIにサインイン
eval $(op signin)

# MFAコード取得の確認
op item get "AWS" --vault Employee --otp
```

#### 1Password CLIが使えない場合

1Password CLIが未認証またはインストールされていない場合、Claude CodeはAskUserQuestionツールでMFAコードの手動入力を求めます。

### リポジトリのクローン

```bash
git clone https://github.com/yourusername/claude-code-sample.git
cd claude-code-sample
```

## VS Code拡張機能

プロジェクト開発に推奨される拡張機能です。

### 推奨拡張機能一覧

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Pylance (`ms-python.vscode-pylance`)
- Python (`ms-python.python`)
- markdownlint (`davidanson.vscode-markdownlint`)
- Biome (`biomejs.biome`)
- Python Debugger (`ms-python.debugpy`)
- CloudFormation Linter (`kddejong.vscode-cfn-lint`)
- Rainbow CSV (`mechatroner.rainbow-csv`)
- Japanese Language Pack (`ms-ceintl.vscode-language-pack-ja`)
- Markdown Preview Mermaid Support (`bierner.markdown-mermaid`)
- Python Environment Manager (`donjayamanne.python-environment-manager`)
- Ruff (`charliermarsh.ruff`)
- SQLFluff (`dorzey.vscode-sqlfluff`)
- vscode-icons (`vscode-icons-team.vscode-icons`)
- YAML (`redhat.vscode-yaml`)

### 自動インストール提案

このリポジトリには `.vscode/extensions.json` が含まれており、VS Codeでプロジェクトを開くと、推奨拡張機能のインストールを自動的に提案します。

### Claude Code CLIの起動

```bash
# リポジトリルートで起動
claude-code
```

## 新規プロジェクト作成手順

このリポジトリで新しいAWS CDKプロジェクトを作成する手順です。Claude Code CLIにプロンプトで依頼することで、Plan Modeから自動的にプロジェクトを構築します。

### 1. Claude Code CLIの起動

```bash
# リポジトリルートで起動
claude-code
```

### 2. プロンプトで新規プロジェクト作成を依頼

Shift + TabでPlan Modeに入った状態で、Claude Codeに以下のようにプロンプトで依頼します。

```text
sample_sfn_athena という新規プロジェクトを作成してください。

要件
- AWS CDK (TypeScript) でインフラ構築
- Step Functions ステートマシンでAthena SQLクエリを実行
- S3にクエリ結果を保存
- EventBridgeで定期実行

以下の構造で作成してください
- sample_sfn_athena/cdk: CDKプロジェクト (TypeScript)
- sample_sfn_athena/sql: Athena SQLファイル
- sample_sfn_athena/docs: 設計書とアーキテクチャ図
```

### 3. 自動実装フロー

Claude Codeが以下を自動実行します。

1. Subagent (design-doc-writer) が設計書を作成
2. Subagent (implementer) がコードを実装
   - プロジェクトディレクトリ作成
   - CDK初期化 (cdk init app --language typescript)
   - pnpmへの切り替え
   - 必要なパッケージのインストール
   - Step Functions ステートマシン定義
   - Athena SQLクエリファイル作成
   - S3バケット、Athena Workgroup定義
   - EventBridgeルール定義
   - CDK Stack定義
3. Hooks がフォーマッターを自動実行 (Biome, SQLFluff, Prettier)
4. Subagent (reviewer) がレビュー実施
5. Skills (building-aws-cdk, checking-aws-security) を参照して実装パターンを適用

### 4. ビルドとデプロイ

実装完了後、以下のコマンドでビルドとデプロイを実行します。

```bash
cd sample_sfn_athena/cdk

# TypeScript型チェック
pnpm run build

# CloudFormationテンプレート生成
pnpm run cdk synth

# 変更差分確認
pnpm run cdk diff

# デプロイ (初回は承認が必要)
pnpm run cdk deploy
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
├── aws-operations.md (paths なし)           - 常時ロード
├── workflow.md   (paths なし)               - 常時ロード
└── markdown.md   (paths なし)               - 常時ロード
```

動作例（CDK TypeScript編集時）

- cdk.md: any型禁止、pnpm使用、ハードコード禁止
- aws-operations.md: MFA認証フロー、MCP経由でのAWS操作
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

### MCPをコードから呼び出す（トークン削減手法）

MCPツールをClaude Codeが直接呼び出すと、レスポンス全体がコンテキストに入りトークンを大量消費します。Skill内のコードからMCPを呼び出し、レスポンスをプレビュー形式に圧縮することで80-90%のトークン削減が可能です。

- [Claude CodeのSkills+MCPでトークン削減](https://dev.classmethod.jp/articles/claude-code-skills-mcp-token-reduction/)
- 実装例: `.claude/skills/aws-mcp-server/`（本リポジトリ）
  - `mcp-client.ts`: `@modelcontextprotocol/sdk`でMCPサーバーに接続
  - `index.ts`: レスポンスを500文字にプレビュー圧縮して返却

### AWS MCP Server（Preview）

AWSが提供するリモートMCPサーバー。IAM認証でAWSリソースへアクセス可能。

- [AWS MCP Servers](https://awslabs.github.io/mcp/)
- [AWS MCP Serverをプレビューとして公開しました](https://dev.classmethod.jp/articles/aws-mcp-server-preview/)

#### 特徴

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| 認証       | IAM認証（SigV4署名）                |
| 監査       | CloudTrailで全MCP呼び出しをログ記録 |
| リージョン | 現在 us-east-1 のみ                 |
| ステータス | Preview版（仕様変更の可能性あり）   |

#### 利用可能なMCPツール

- `aws___search_documentation` - AWSドキュメント検索
- `aws___read_documentation` - ドキュメント読み取り
- `aws___call_aws` - AWS API呼び出し
- `aws___recommend` - AWS推奨事項取得
- `aws___list_regions` - リージョン一覧
- `aws___get_regional_availability` - リージョン別サービス可用性

#### MCP専用IAMアクション（将来的な多層防御）

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

ただし現時点ではPreview版のため、コードレベルでのブロック（`.claude/skills/aws-mcp-server`）で十分。IAMポリシーはGA後に検討。

#### 本プロジェクトでの実装パターン

MCPを直接呼び出すとレスポンス全体がコンテキストに入りトークンを消費するため、スクリプト経由でプレビュー形式に圧縮して返却。

```text
.claude/skills/aws-mcp-server/
├── SKILL.md          # スキル定義
├── index.ts          # CLI（search, api, tools コマンド）
├── mcp-client.ts     # MCPクライアント（mcp-proxy-for-aws経由）
└── package.json
```

使用例

```bash
# AWS認証情報をインライン環境変数で指定
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy AWS_SESSION_TOKEN=zzz \
  pnpm exec tsx .claude/skills/aws-mcp-server/index.ts search "Lambda concurrency" 5
```

破壊的操作（create, delete, update等）はコード内でブロック済み。

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
  - MCP統合はSkills内でハードコード（各Skillが独立してMCPサーバー設定を保持）
