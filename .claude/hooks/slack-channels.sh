#!/bin/bash
# .claude/hooks/slack-channels.sh
CHANNEL=$(jq -r '.tool_input.channel_id')
ALLOWED="C07DEVBOTS"   # #dev-bots

if [ "$CHANNEL" != "$ALLOWED" ]; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Із сесії в Slack можна писати лише в #dev-bots"
    }
  }'
fi
