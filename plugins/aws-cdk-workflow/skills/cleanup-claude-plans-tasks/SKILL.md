---
name: cleanup-claude-plans-tasks
description: Delete completed Claude Code plan files (.claude/plans/) and finished tasks from TaskList. Use after completing planned work to keep workspace clean.
allowed-tools: Read, Glob, Bash(rm *), Bash(ls *), TaskList, TaskUpdate
---

# Cleanup Claude Code Plans and Tasks

Clean up plan files and TaskList tasks for the current project.

## Your Task

### Step 1: List Current State

Run in parallel.

Plan files (project-local)

```bash
ls -la .claude/plans/
```

TaskList (project-specific via `CLAUDE_CODE_TASK_LIST_ID`)

```text
Use TaskList tool to get current project's tasks.
```

### Step 2: Ask User

Show the results and ask for confirmation.

```text
## Current State

### Plan Files (.claude/plans/)
- file1.md (2025-01-15)
- file2.md (2025-01-16)

### TaskList (CLAUDE_CODE_TASK_LIST_ID: xxx)
- ID 1: Task subject (completed)
- ID 2: Task subject (in_progress)

Delete completed items? (yes/no)
```

### Step 3: Delete

If user approves, delete the selected items.

Plan files

```bash
rm .claude/plans/<filename>.md
```

TaskList tasks (via TaskUpdate)

```text
TaskUpdate: set status to "deleted" for each completed task.
```

## Notes

- TaskList returns only tasks for current project (based on `CLAUDE_CODE_TASK_LIST_ID` in settings.json)
- Do not delete `in_progress` tasks
- Do not delete plan files with incomplete tasks
