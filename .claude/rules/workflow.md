# 開発フロー（Subagent活用）

## 基本方針

状況に応じて適切なsubagentを選択する。全てのステップが必須ではない。

重要な原則:

- ユーザーの要求に応じて柔軟に開始地点を選ぶ
- 成果物（計画ファイル、設計書、調査レポート）が存在すれば自動参照
- 品質とスピードのバランスを考慮
- ファイル/関数/クラス名を変更する場合は、必ずGrepツールで全参照を検索し、全て更新する
  - 対象: コード、設定ファイル、ドキュメント、CloudFormationテンプレート
  - リソース名、変数名、定数名、環境変数名、型名も同様に確認
- TodoWriteで作成したタスクは完了してから作業終了する

## よくあるパターン

### パターン1: シンプル実装

ユーザー: 「Lambda関数を実装して」

フロー:

1. implementer（実装）
2. reviewer（レビュー）
3. unit-tester（ビルド検証・単体テスト）

### パターン2: 調査+実装

ユーザー: 「DuckDBとIcebergの連携を実装して」

フロー:

1. docs-researcher（技術調査、必要に応じて）
2. implementer（実装）
3. reviewer（レビュー）
4. unit-tester（ビルド検証・単体テスト）

### パターン3: Plan Modeからの実装

ユーザーがPlan Modeで計画立案後

重要: 新規プロジェクトでは必ずこの順序を守る

Plan Mode中の必須チェックリスト

- このworkflow.mdを読んで正しいフローを確認する
- ユーザーにprojectName（リソースprefix）を確認する（例: cm-kasama-projectname）
- AWS構成図の方式を選択
- 計画ファイルの最初のステップを「設計書作成」にする
- 計画ファイルに「workflow.md パターン3に基づく」と明記する

選択基準

- Markdown内に埋め込み、テキストで編集したい → Mermaid
- GitHubでアイコン表示、画像として出力したい → Diagram MCP
- 指定がなければデフォルトはMermaid

フロー

1. design-doc-writer（設計書作成、新規プロジェクトは必須）
2. implementer（実装）
3. reviewer（レビュー）
4. 直接Edit（コード修正、必要に応じてドキュメント更新）
5. unit-tester（ビルド検証・単体テスト）

実装フェーズでの注意

- 計画ファイルを実行する前に、このworkflow.mdと照合する
- 「設計書作成」が最初のステップになっているか確認する
- 既存プロジェクトの「ファイル配置順序」と「開発フロー」は別物

更新すべきドキュメント（実装・レビューで判明した問題がある場合のみ）

- プロジェクト内設計書（design.md）: 重要な実装変更があれば反映
- .claude/rules/: ユーザー指摘の開発方針（「この書き方やめて」「pnpm使って」）
- .claude/agents/: subagentの改善が必要な箇所
- Markdownルール（@.claude/rules/markdown.md）遵守

更新不要

- ルートREADME.md、CLAUDE.md

### パターン4: レビューのみ

ユーザー: 「このコードをレビューして」

フロー:

1. reviewer（レビュー）

### パターン5: 結合テスト

ユーザー: 「デプロイ済みの環境で動作確認して」

フロー:

1. integration-tester（テスト項目書作成）
2. ユーザーがjob実行（Step Functions等）
3. integration-tester（参照系コマンドで結果取得・エビデンス作成）

前提条件

- CDK スタックがデプロイ済み
- aws-operations.md の MFA 認証フローに従って認証情報を取得済み

integration-testerの役割

- テスト項目書の作成（`docs/test-evidence.md`）
- aws-mcp-server skillで結果を取得
- Athenaクエリでデータ検証（SELECTのみ）
- Markdownエビデンスを作成

実行しないこと

- start-execution 等の長時間job実行
- 理由: timeoutリスクと権限管理のためユーザーに委ねる

出力

- `(プロジェクト)/docs/test-evidence.md` にテスト項目とエビデンスを保存

## エージェントの役割分担

| エージェント | 責務 | ビルド検証 |
| --- | --- | --- |
| implementer | 実装コード作成 | なし |
| reviewer | コードレビュー | なし |
| unit-tester | 単体テスト作成・実行 | あり（pnpm run build, cdk synth） |
| integration-tester | テスト項目書作成、参照系コマンドでエビデンス作成、Athenaデータ検証 | なし（デプロイ済み前提、長時間job実行はユーザー） |

## ファイル連携

メインエージェントがSubagent起動時にファイルパスを明示して参照を指示

成果物ファイル

- 計画ファイル: `.claude/plans/*.md`
- 設計書: `(プロジェクト)/docs/design.md`
- 調査レポート: `.tmp/research/*.md`

## 一時ファイルの管理

- `.tmp/research/`: 調査中の一時保存場所
- 調査結果は必要に応じて設計書 (`(プロジェクト)/docs/`) に反映
