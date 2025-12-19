---
paths: "**/*.py"
---

# Python Lambda

## 開発

- Pythonコードは `resources/` 配下に配置（Lambda、Glue、その他）
- 依存関係は `requirements.txt` で管理
- CDK constructsが自動的にパッケージングを処理（PythonFunction、GlueJob等）

## ガイドライン

- 型ヒントを必ず使用 (`def func(arg: str) -> dict:`)
- AWS clientはグローバルスコープで初期化（Lambda/コンテナのウォームスタート最適化）
- 環境変数に機密情報を平文で保存しない。代わりに Secrets Manager または Parameter Store を使用
- 共通コードの再利用は、まず既存コード内で解決を検討。Lambda Layerやライブラリ化は最終手段
