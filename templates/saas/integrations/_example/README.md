# Example Integration Template

This directory contains a template for creating new integrations.

## Usage

1. Copy the `provider-template` directory to the appropriate type directory:
   ```bash
   cp -r _example/provider-template payments/your-provider
   ```

2. Update `integration.json` with your provider's details

3. Implement the library functions in `lib/{provider}.ts`

4. Create API routes in `app/api/{provider}/`

5. Add UI components in `components/{category}/`

6. Update `templates/saas/template.json` to declare support

7. Add documentation to `docs/integrations/{type}/{provider}.md`

## Files

- `integration.json` - Metadata template with all fields
- `lib/example.ts` - Core library pattern with env validation
- `app/api/example/upload/route.ts` - API route handler pattern
- `components/example/file-upload.tsx` - UI component pattern

## See Also

- [Adding Integrations Guide](/docs/integrations/ADDING_INTEGRATIONS.md)
- [Integration Audit](/docs/integrations/INTEGRATION_AUDIT.md)
- [Integration Capabilities](/docs/integrations/INTEGRATION_CAPABILITIES.md)

