---
name: building-aws-cdk
description: Provides AWS CDK implementation patterns with TypeScript using L2 Constructs for Lambda, IAM, S3, DynamoDB. Applies type-safe patterns, resource naming conventions, security best practices. Use when creating CDK stacks, defining AWS resources, or implementing infrastructure as code with TypeScript.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# AWS CDK実装サンプル

Lambda + S3 + Glue Catalog連携のCDK実装例を提供

## 実装パターン

Lambda + S3 + Glue Catalog連携のCDK実装パターンを提供

- 型安全なStack定義
- S3バケット作成（暗号化、パブリックアクセスブロック）
- IAM Role定義（最小権限）
- Lambda関数とLayer設定
- リソース命名規則

## 詳細ガイド

[coding-conventions.md](coding-conventions.md) - コーディング規約
