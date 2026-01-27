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
│   ├── rules/                     # プロジェクトルール
│   ├── plans/                     # 計画ファイル
│   └── settings.json              # プロジェクト設定
├── .claude-plugin/                # プラグインマーケットプレース定義
│   └── marketplace.json
├── plugins/                       # プラグイン本体
│   └── aws-cdk-workflow/          # AWS CDK開発ワークフロープラグイン
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── agents/                # Subagent定義（6個）
│       ├── skills/                # スキル定義（7個）
│       ├── hooks/                 # フック設定
│       └── .mcp.json              # MCP設定
├── docs/                          # ドキュメント
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

- Node.js 20+ (pnpm、CDK用)
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

miseでNode.js、Python、pnpmのバージョンを管理します。

```bash
# miseのインストール（macOS）
brew install mise

# シェルにmiseを有効化（~/.zshrcに追加）
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc

# リポジトリをクローン
git clone https://github.com/yourusername/claude-code-sample.git
cd claude-code-sample

# 設定ファイルを信頼（初回のみ）
mise trust

# ツールのインストール（mise.tomlに定義されたバージョン）
mise install

# その他のツール（個別インストール）
brew install awscli
pnpm add -g aws-cdk
brew install claude-code
brew install --cask 1password-cli  # オプション
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

### LSPサーバーのセットアップ

Claude Codeのコード補完、型エラー検出、定義ジャンプ機能を使用するには、言語サーバーのインストールが必要です。

```bash
# TypeScript Language Server
pnpm add -g typescript-language-server typescript

# Python Language Server (Pyright)
pnpm add -g pyright
```

このリポジトリの `.claude/settings.json` には、以下のLSPプラグインが設定済みです。

- `typescript-lsp@claude-plugins-official`
- `pyright-lsp@claude-plugins-official`

バイナリをインストール後、Claude Code起動時に自動的にプラグインが有効化されます。

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

## このリポジトリをプラグインとして使用する

このリポジトリには、AWS CDK + Python開発用のagents、skills、hooksがプラグインとして含まれており、別リポジトリから参照して再利用できます。

### プラグイン構造

```text
claude-code-sample/
├── .claude-plugin/
│   └── marketplace.json              # マーケットプレース定義（プラグイン一覧）
└── plugins/
    └── aws-cdk-workflow/             # プラグイン本体
        ├── .claude-plugin/
        │   └── plugin.json           # プラグインメタデータ
        ├── agents/                   # Subagent定義（6個）
        ├── skills/                   # スキル定義（7個）
        ├── hooks/                    # フック設定（自動フォーマット、通知音）
        └── .mcp.json                 # MCP設定
```

### プラグインに含まれる機能

- Agents 6個（設計書作成、調査、実装、レビュー、テスト）
- Skills 7個（CDK、Python Lambda、セキュリティ、図作成等）
- Hooks 3種類（自動フォーマット、通知音）

### 方法1: GitHubリポジトリから参照

別プロジェクトの `.claude/settings.json` に以下を追加します。

```json
{
  "extraKnownMarketplaces": {
    "cm-kasama-plugins": {
      "source": {
        "source": "github",
        "repo": "cm-yoshikikasama/claude-code-sample"
      }
    }
  },
  "enabledPlugins": {
    "aws-cdk-workflow@cm-kasama-plugins": true
  }
}
```

全プロジェクト共通で使う場合は `~/.claude/settings.json` に設定してください。

### 方法2: ローカルディレクトリから参照

このリポジトリをcloneして、ローカルパスから参照する方法です。開発・テスト用途に適しています。

別プロジェクトの `.claude/settings.json` に以下を追加します。

```json
{
  "extraKnownMarketplaces": {
    "local-plugins": {
      "source": {
        "source": "directory",
        "path": "<このリポジトリをcloneした絶対パス>"
      }
    }
  },
  "enabledPlugins": {
    "aws-cdk-workflow@cm-kasama-plugins": true
  }
}
```

`path` にはこのリポジトリをcloneしたディレクトリの絶対パスを指定します。Claude Codeは指定パス直下の `.claude-plugin/marketplace.json` を読み取り、プラグインを検出します。

```bash
# 例: cloneしたパスを確認
cd claude-code-sample && pwd
```

### 注意事項

- 通知サウンドはmacOS専用です（`afplay` コマンドを使用）
- permissions、env変数、statusLineはプラグインに含まれないため、各プロジェクトで個別設定が必要です
- `enabledPlugins` のキーは `<プラグイン名>@<marketplace.jsonのname>` の形式です（`extraKnownMarketplaces` のキー名ではない）

## 詳細ガイドライン

プロジェクトの詳細ルールは以下を参照

- 主要ガイドライン: CLAUDE.md
- AWS CDK (TypeScript): .claude/rules/cdk.md
- Python Lambda: .claude/rules/python.md
- AWS操作: .claude/rules/aws-operations.md
- 開発フロー（Subagent活用）: .claude/rules/workflow.md
- Markdown編集ルール: .claude/rules/markdown.md

## ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| [Claude Code 6機能の使い分け](docs/claude_code_features.md) | MCP、Subagents、Skills、Rules、Hooks、Slash Commandsの詳細 |
| [参考資料](docs/references.md) | Claude Code活用のためのリンク集、MCP詳細 |
| [ベストプラクティス](docs/claude_code_best_practices.md) | CLAUDE.md、コンテキスト管理、Hooks等のベストプラクティス |
| [コンテキストガイド](docs/claude_context_guide.md) | コンテキスト管理の詳細ガイド |
