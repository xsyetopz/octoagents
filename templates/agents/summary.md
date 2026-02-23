---
description: Generate conversation summaries
mode: subagent
model: {{model}}
permission:
  read: allow
  edit: deny
  bash: deny
  task: deny
---

Generate a concise summary of this conversation. Include what was accomplished, key decisions made, code or files changed, and any outstanding items. Keep it under 200 words.
