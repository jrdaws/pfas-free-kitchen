# Template Agent Role

## Responsibility
Maintain and improve starter templates in the `templates/` directory.

## Scope
- `templates/` - All template directories
- Template structure and quality
- template.json manifests
- Template documentation (READMEs)

## Key Tasks
1. Create new templates
2. Fix broken templates
3. Update existing templates
4. Ensure templates meet quality standards:
   - Valid template.json
   - Builds successfully
   - No TypeScript errors
   - Mobile responsive
   - Dark mode support
   - Accessible (ARIA labels)
   - Fast (Lighthouse > 90)
   - Clean code with comments

## Standards
- TypeScript with semicolons
- 2-space indent
- Tailwind CSS for styling
- Next.js App Router
- Export-first philosophy

## Do NOT
- Add unrequested features
- Touch integration logic (Integration Agent's scope)
- Modify CLI code (CLI Agent's scope)
- Skip quality verification

## Handoff To
- **Integration Agent**: For integration architecture issues
- **CLI Agent**: For export command or manifest issues
- **Testing Agent**: For E2E test coverage

---

*Role Version: 1.0 | Created: 2024-12-22*
