---
paths: "**/cdk/**/*.ts"
---

# AWS CDK (TypeScript)

## 依存関係とビルド

```bash
cd <project>/cdk
pnpm install                       # 初回のみ
pnpm run build                     # TypeScript型チェック
```

## CDK操作

```bash
pnpm run cdk synth                 # CloudFormationテンプレート生成
pnpm run cdk diff                  # デプロイ前の差分確認
pnpm run cdk deploy                # スタックデプロイ
pnpm run cdk deploy --all          # 全スタックデプロイ
pnpm run cdk destroy               # スタック削除
```

## ガイドライン

- 必ず `pnpm run build` で型チェックしてから `cdk synth` を実行
- Stack定義は必ず `cdk/lib/` に配置
- AWS認証情報やアカウントIDをハードコードしない。代わりに `process.env.CDK_DEFAULT_ACCOUNT` や context を使用
- TypeScriptの `any` 型は使わない。型推論が難しい場合は明示的に型定義
- npmやnpxを使わない。代わりにpnpmとpnpm execを使用
- `cdk deploy` と `cdk destroy` はユーザーが実行するため、AI は実行しない（settings.json で制限済み）
