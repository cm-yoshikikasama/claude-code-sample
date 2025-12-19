---
name: checking-aws-security
description: Security checklist for AWS CDK implementations. Verify IAM minimum privileges, encryption settings, secret management, public access blocks. Use after implementing CDK stacks, before cdk synth, or during code reviews.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# AWSセキュリティ実装パターン

セキュアなCDK実装のためのサンプルコードとチェックリスト

## セキュリティパターン

CDK実装のセキュリティベストプラクティス

- S3暗号化 + パブリックアクセスブロック
- Lambda専用IAMロール（最小権限）
- IAMポリシー設計（Good/Bad例）

## 詳細ガイド

[security-checklist.md](security-checklist.md) - セキュリティチェックリスト
