---
name: writing-python-lambdas
description: Provides Python Lambda implementation patterns with type hints, boto3 client initialization optimization, and proper error handling. Use when creating or modifying Python Lambda code, implementing AWS Lambda handlers, or working with boto3 clients.
---

# Python Lambda実装

## Quick start

基本的なLambda handler:

```python
import json
from typing import Any

def lambda_handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    """Lambda handler"""
    try:
        # メイン処理
        result = process(event)

        return {
            "statusCode": 200,
            "body": json.dumps({"result": result})
        }
    except Exception as e:
        print(f"Lambda failed: {str(e)}")
        raise
```

## Lambda implementation workflow

Copy this checklist and track your progress:

```text
Task Progress:
- [ ] Step 1: Create handler structure
- [ ] Step 2: Add type hints to all functions
- [ ] Step 3: Initialize boto3 clients at global scope
- [ ] Step 4: Implement error handling with try-except-raise
- [ ] Step 5: Add logging statements
- [ ] Step 6: Validate against coding conventions
```

### Step 1: Create handler structure

Use the Quick start template above as the foundation.

### Step 2: Add type hints

All functions must have type hints. Required imports:

```python
from typing import Any, Dict, List, Optional
```

### Step 3: Initialize boto3 clients

Move client initialization to global scope for Lambda warm start optimization:

```python
# Good - グローバルスコープ
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    s3_client.get_object(...)
```

See [coding-conventions.md](coding-conventions.md) for details.

### Step 4: Implement error handling

Always use try-except with re-raise pattern:

```python
try:
    # main logic
except Exception as e:
    print(f"Lambda failed: {str(e)}")
    raise  # Must re-raise for CloudWatch Logs
```

### Step 5: Add logging

Use print statements with clear formatting:

```python
print("Lambda started")
print(f"Processing: {item_count:,} items")
print("Lambda completed")
```

### Step 6: Validate

Cross-reference with [coding-conventions.md](coding-conventions.md) to ensure compliance.

## 詳細ガイド

[coding-conventions.md](coding-conventions.md) - コーディング規約、実装例
