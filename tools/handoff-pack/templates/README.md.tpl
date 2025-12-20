# dawson-does-framework handoff archive
schema: archive_readme_v1
created_at: {{created_at}}

## Purpose
Deterministic, offline handoff pack.

## Structure
- chat/0001_chat_raw.md
- chat/0002_chat_index.json
- context/*.md
- artifacts/*.md
- repo/* (recommended additions)
- platform_export/* (optional)

## Integrity
- chat_index.json contains byte offsets + sha256 for each message payload.
