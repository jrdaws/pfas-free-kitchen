================================================================================
AGENT PROMPTS - DAWSON-DOES-FRAMEWORK
================================================================================

Created: 2025-12-22
Purpose: Advanced prompts for continuing framework development

================================================================================
CONTENTS
================================================================================

1. 01-TESTING-live-api-validation.txt
   - Priority: HIGH
   - Agent: Testing Agent
   - Time: 30-45 minutes
   - Description: Validate all AI agent optimizations with real Anthropic API

2. 02-PLATFORM-parallel-api-calls.txt
   - Priority: MEDIUM
   - Agent: Platform Agent
   - Time: 15-25 minutes
   - Description: Run Code and Context generation in parallel for ~13% speedup

3. 03-PLATFORM-json-repair-enhancement.txt
   - Priority: LOW (OPTIONAL)
   - Agent: Platform Agent
   - Time: 30-45 minutes
   - Description: Add enum normalization to JSON repair for Haiku reliability

================================================================================
RECOMMENDED ORDER
================================================================================

1. FIRST: Run 01-TESTING prompt
   - Confirms all recent work is functioning correctly
   - Requires an Anthropic API key

2. SECOND: Run 02-PLATFORM prompt
   - Quick performance win (~10 second speedup)
   - No API key required for implementation

3. OPTIONAL: Run 03-PLATFORM prompt
   - Only if using 'fast' tier and experiencing failures
   - Enhances Haiku model reliability

================================================================================
HOW TO USE
================================================================================

1. Open the desired .txt file
2. Copy the entire content
3. Start a new Cursor chat
4. Paste the prompt as the first message
5. The agent will follow the governance bootstrap and execute the task

================================================================================
NOTES
================================================================================

- All prompts follow project governance (AGENT_CONTEXT.md, .cursorrules)
- Each prompt includes success criteria and validation steps
- Memory files should be updated after completing each task
- Commit convention: <type>(<scope>): <description>

================================================================================

