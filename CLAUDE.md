# CLAUDE.md

AWS CDK (TypeScript) + Pythonプロジェクト。Claude Codeベストプラクティスと実装サンプルを含みます。ユーザーが質問したとき（特に疑問符で終わっているとき）は、勝手に作業をしないで、まず質問に答えてください。

## プロジェクト構造

```text
.
├── docs/                          # 参考資料（添付ファイル、通常参照不要）
└── sample_*/                      # サンプルプロジェクト
    ├── cdk/                       # CDKインフラコード (TypeScript)
    │   ├── lib/                   # Stack定義
    │   ├── bin/                   # CDK app entry point
    │   └── package.json
    ├── resources/                 # Pythonコード（Lambda、Glue等）またはデータファイル
    └── sql/                       # SQLスクリプト（必要に応じて）
```

## 詳細ガイドライン

プロジェクトの詳細ルールは以下のファイルを参照

- AWS CDK (TypeScript): @.claude/rules/cdk.md
- AWS操作: @.claude/rules/aws-operations.md
- Python Lambda: @.claude/rules/python.md
- 開発フロー（Subagent活用、ドキュメント更新）: @.claude/rules/workflow.md
- Markdown編集ルール: @.claude/rules/markdown.md
