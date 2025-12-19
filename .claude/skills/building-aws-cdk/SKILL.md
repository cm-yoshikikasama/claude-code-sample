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

# AWS CDK実装

## Quick start

基本的なStack定義:

```typescript
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

interface MyStackProps extends cdk.StackProps {
  envName: string;
  projectName: string;
}

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    const { envName, projectName } = props;

    // リソース定義
    new s3.Bucket(this, "Bucket", {
      bucketName: `${projectName}-${envName}-bucket`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
  }
}
```

## CDK implementation workflow

Copy this checklist and track your progress:

```text
Task Progress:
- [ ] Step 1: Define Stack interface with typed props
- [ ] Step 2: Create resources with proper naming convention
- [ ] Step 3: Apply security best practices (encryption, IAM)
- [ ] Step 4: Validate with pnpm run build
- [ ] Step 5: Verify with pnpm run cdk synth
- [ ] Step 6: Cross-reference with coding conventions
```

### Step 1: Define Stack interface with typed props

Stack props must extend cdk.StackProps:

```typescript
interface MyStackProps extends cdk.StackProps {
  envName: string;
  projectName: string;
}
```

Never use `any` type in TypeScript.

### Step 2: Create resources with proper naming convention

Use consistent naming pattern: `${projectName}-${envName}-${resourceType}`

```typescript
const bucketName = `${projectName}-${envName}-bucket`;
```

### Step 3: Apply security best practices

Required security settings:

- S3: encryption + blockPublicAccess
- IAM: Specific resource ARNs (avoid `Resource: "*"`)
- Lambda: Dedicated IAM role per function

See [coding-conventions.md](coding-conventions.md) for details.

### Step 4: Validate with pnpm run build

Run TypeScript build to check type errors:

```bash
cd cdk
pnpm run build
```

Fix all type errors before proceeding.

### Step 5: Verify with pnpm run cdk synth

Generate CloudFormation template:

```bash
pnpm run cdk synth
```

Review the generated template for correctness.

### Step 6: Cross-reference with coding conventions

Validate against [coding-conventions.md](coding-conventions.md) to ensure compliance.

## 詳細ガイド

[coding-conventions.md](coding-conventions.md) - コーディング規約
