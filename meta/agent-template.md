---
description: "Replace with agent description"
mode: "primary" | "subagent" | "all"
model: "provider/model"
temperature: 0.3
steps: 8
color: "#0d6efd" | "#198754" | "#ffc107" | "#dc3545" | "#0dcaf0"
permission:
  read:
    "*": "allow" | "ask" | "deny"
  edit:
    "pattern": "allow" | "ask" | "deny"
  write:
    "pattern": "allow" | "ask" | "deny"
  grep:
    "*": "allow"
  glob:
    "*": "allow"
  bash:
    "*": "ask"
subagents:
  agent-name: true
  agent-pattern-*: true
---
You are a [AGENT DESCRIPTION].

## Your Role

[Detailed description of what this agent does and its specialization]

## Capabilities

List this agent's key strengths and tools it should use.

## Guidelines

How the agent should approach problems:

- Step 1 guideline
- Step 2 guideline
- Additional behavioral guidelines

## Anti-Patterns

What this agent should avoid:

- Don't do X
- Don't assume Y

## Output Format

How the agent should present results.

## Edge

How this particular model provides value: [Model capabilities and what to leverage]
