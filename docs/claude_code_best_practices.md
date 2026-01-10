# Claude Code: Best Practices & Anti-Patterns

A comprehensive guide to effective Claude Code usage, extracted from production experience at scale.

## Table of Contents

- [CLAUDE.md](#claudemd)
- [Context Management](#context-management)
- [Custom Subagents](#custom-subagents)
- [Hooks](#hooks)
- [Planning Mode](#planning-mode)
- [Skills & MCP](#skills--mcp)
- [GitHub Actions](#github-actions)

---

## CLAUDE.md

### CLAUDE.md Best Practices

#### Start with Guardrails, Not a Manual

- Begin small and document based on what Claude is getting wrong
- Let the file grow organically based on actual failure patterns
- Focus on the 80% use cases, not edge cases

#### Effective Documentation Strategy

- Only document tools/APIs used by 30%+ of your team
- Allocate "token budgets" for each tool's documentation (max token count)
- Keep it concise - aim for 10-15 bullets per major tool
- Use CLAUDE.md as a forcing function to simplify your tooling

#### Pointing to Additional Docs

- Don't just mention file paths - pitch the agent on WHEN to read them
- Example: "For complex usage or if you encounter FooBarError, see path/to/docs.md"
- Explain the conditions that should trigger reading additional documentation

#### Provide Alternatives

- Never use negative-only constraints
- Bad: "Never use the --foo-bar flag"
- Good: "Never use --foo-bar, prefer --baz instead"
- Always give the agent a path forward

#### Structure Example

```markdown
# Monorepo

## Python

- Always use virtual environments
- Test with: pytest tests/
- Format with: black . [8-10 more key guidelines]

## Internal CLI Tool

- Usage: tool-name [command] [options]
- Always validate before running
- Never use --unsafe, prefer --safe-mode [7-10 more guidelines]

For advanced usage or ToolSpecificError, see docs/tool-guide.md
```

### CLAUDE.md Anti-Patterns

#### Context Bloat

- Don't @-mention entire documentation files in CLAUDE.md
- This embeds the full file content on every run, wasting tokens
- Mention paths strategically instead

#### Comprehensive Manuals

- Don't try to document everything
- This signals your underlying tools are too complex
- Instead, build simpler CLI wrappers and document those

#### Negative-Only Constraints

- Avoid statements like "Don't do X" without alternatives
- The agent will get stuck when it thinks it must do X
- Always provide the preferred approach

---

## Context Management

### Context Management Best Practices

#### Monitor Your Context Window

- Run `/context` regularly to see token usage
- Typical baseline: 10-20% for repo context, 80-90% for work
- Be aware of your 200k token budget

#### Simple Restart: /clear + catchup

- Default method for rebooting sessions
- After /clear, ask Claude to read all changed files in the branch
- Quick and effective for most scenarios

#### Complex Restart: Document & Clear

- For large, multi-step tasks
- Have Claude dump its plan and progress to a .md file
- Clear the session
- Start fresh by reading the .md and continuing
- Creates durable, external "memory"

### Context Management Anti-Patterns

#### Relying on /compact

- Automatic compaction is opaque and error-prone
- Not well-optimized for most use cases
- Avoid as much as possible

#### Ignoring Context Growth

- Letting your context window fill up slowly
- Not proactively clearing when switching tasks
- This leads to degraded performance and confusion

---

## Custom Subagents

### Custom Subagents Best Practices

#### Use Master-Clone Architecture

- Put all key context in CLAUDE.md
- Use built-in `Task(...)` feature to spawn clones
- Let the main agent decide when and how to delegate
- Agents manage their own orchestration dynamically

#### When to Use Task()

- For parallel, independent work
- When context needs to be isolated temporarily
- For specialized exploration tasks

### Custom Subagents Anti-Patterns

#### Specialized Subagents That Gatekeep Context

- Creating a "PythonTests" subagent hides testing context from main agent
- Main agent can't reason holistically anymore
- Forced to invoke subagent just to validate code

#### Lead-Specialist Model

- Dictating rigid workflows through subagent design
- Forcing human-defined delegation patterns
- The agent should solve delegation, not follow your template

#### Context Fragmentation

- Splitting knowledge across multiple specialized agents
- Creates coordination overhead
- Prevents holistic reasoning about changes

---

## Hooks

### Hooks Best Practices

#### Block-at-Submit Strategy

- Primary hook pattern: validate at commit time
- Example: `PreToolUse` hook that wraps `Bash(git commit)`
- Check for pass/fail signals before allowing commit
- Forces "test-and-fix" loop until build is green

#### Let the Agent Finish

- Allow the agent to complete its full plan
- Check the final result at the commit stage
- This respects the agent's reasoning process

#### Hint Hooks

- Use for non-blocking feedback
- Provide "fire-and-forget" suggestions
- Don't interrupt the agent's flow

#### Example Pattern

```javascript
// PreToolUse hook for git commit
if (tool === "Bash" && args.command.includes("git commit")) {
  if (!fs.existsSync("/tmp/agent-pre-commit-pass")) {
    return { block: true, message: "Tests must pass before commit" };
  }
}
```

### Hooks Anti-Patterns

#### Block-at-Write Hooks

- Blocking on `Edit` or `Write` operations
- Confuses or "frustrates" the agent mid-plan
- Interrupts the agent's reasoning flow

#### Over-Constraining

- Too many blocking hooks
- Making it impossible for the agent to make progress
- Creates frustrating loops

---

## Planning Mode

### Planning Mode Best Practices

#### Always Plan for Complex Changes

- Use built-in planning mode for non-trivial features
- Align on the approach before implementation
- Define inspection checkpoints

#### Set Expectations

- Clarify both HOW to build and WHEN to show work
- Build intuition for minimal context needed
- Iterate on plans before execution

#### For Enterprises

- Consider custom planning tools built on Claude Code SDK
- Align outputs with your technical design formats
- Enforce internal best practices at plan time

---

## Skills & MCP

### Skills & MCP Best Practices

#### Prefer Skills for Most Workflows

- Skills formalize the "scripting" model
- More robust and flexible than rigid MCP tools
- Give agents access to raw environment

#### The Three Stages of Agent Autonomy

1. Single Prompt (brittle, doesn't scale)
2. Tool Calling (better, but creates abstractions)
3. Scripting (agent writes code to interact with environment)

#### MCP as Secure Gateway

- Use MCP for auth, networking, and security boundaries
- Provide few, high-level tools:
  - `download_raw_data(filters...)`
  - `take_sensitive_gated_action(args...)`
  - `execute_code_in_environment_with_state(code...)`

#### When to Use MCP

- Complex, stateful environments (e.g., Playwright)
- Secure access to sensitive systems
- As a data gateway, not as an abstraction layer

#### Migration Path

- Migrate stateless tools (Jira, AWS, GitHub) to CLIs
- Keep MCPs simple and focused
- Let the agent script against raw data

### Skills & MCP Anti-Patterns

#### Bloated MCP Servers

- Dozens of tools that mirror REST APIs
- `read_thing_a()`, `read_thing_b()`, `update_thing_c()`
- Context-heavy with limited flexibility

#### Over-Abstraction

- Trying to abstract reality for the agent
- Creating rigid API-like interfaces
- Limiting agent's ability to reason about raw data

#### Using MCP for Everything

- MCP isn't always the right tool
- Simple CLIs are often better
- Skills handle most scripting needs

---

## GitHub Actions

### GitHub Actions Best Practices

#### Operationalize Claude Code

- Run Claude Code in GHA for "PR-from-anywhere" tooling
- Trigger from Slack, Jira, CloudWatch alerts
- Full agent capabilities with strong sandboxing

#### Log Analysis for Improvement

```bash
$ query-claude-gha-logs --since 5d | \
  claude -p "see what other claudes were stuck on and fix it"
```

#### Data-Driven Flywheel

1. Agents encounter bugs
2. Logs capture the issues
3. Improve CLAUDE.md and CLIs
4. Better agent performance
5. Repeat

#### Audit and Control

- Full agent logs for compliance
- Control entire container and environment
- Stronger sandboxing than web UIs
- Support for all advanced features (Hooks, MCP)

#### Customization Advantages

- More control than Cursor background agents
- More sandboxing than Codex managed UI
- Full access to your infrastructure
- Complete audit trail

---
