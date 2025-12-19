---
name: checking-aws-security
description: Security checklist for AWS CDK implementations. Verify IAM minimum privileges, encryption settings, secret management, public access blocks. Use after implementing CDK stacks, before cdk synth, or during code reviews.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# AWSセキュリティレビュー

## Security review workflow

Copy this checklist and track your progress:

```text
Security Review Progress:
- [ ] Step 1: IAM最小権限チェック
- [ ] Step 2: S3セキュリティチェック
- [ ] Step 3: Lambdaセキュリティチェック
- [ ] Step 4: シークレット管理チェック
- [ ] Step 5: 問題点の文書化
- [ ] Step 6: 修正確認
```

### Step 1: IAM最小権限チェック

Review IAM policies for:

- Resource: "\*" usage (avoid unless necessary like STS)
- Specific resource ARNs
- Use of grant methods (grantRead, grantReadWrite)
- Dedicated IAM role per Lambda function

See [security-checklist.md](security-checklist.md) for detailed items.

### Step 2: S3セキュリティチェック

Verify S3 buckets have:

- encryption: s3.BucketEncryption.S3_MANAGED
- blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
- versioned: true (本番環境推奨)

### Step 3: Lambdaセキュリティチェック

Verify Lambda functions have:

- Dedicated IAM role
- No secrets in environment variables
- Appropriate timeout settings
- VPC configuration (if needed)

### Step 4: シークレット管理チェック

Verify:

- No plain text secrets in environment variables
- Use of Secrets Manager or Parameter Store
- Lambda has grantRead permission for secrets

### Step 5: 問題点の文書化

Document all security issues found with:

- Severity (Critical/High/Medium/Low)
- Location (file path and line number)
- Specific remediation steps

### Step 6: 修正確認

After fixes are applied:

- Re-run security checks
- Verify all Critical and High issues resolved
- Run `pnpm run cdk synth` to validate

## 詳細ガイド

[security-checklist.md](security-checklist.md) - セキュリティチェックリスト
