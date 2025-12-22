import { readFile } from "fs/promises";
import { join } from "path";
export class TemplateSelector {
    constructor(templatesDir) {
        // Default to templates directory relative to project root
        this.templatesDir = templatesDir || join(process.cwd(), "templates");
    }
    /**
     * Load template metadata from template.json
     */
    async loadTemplate(templateId) {
        try {
            const templatePath = join(this.templatesDir, templateId, "template.json");
            const content = await readFile(templatePath, "utf-8");
            return JSON.parse(content);
        }
        catch (error) {
            throw new Error(`Failed to load template "${templateId}": ${error.message}`);
        }
    }
    /**
     * Select template based on intent
     */
    async selectTemplate(intent) {
        return this.loadTemplate(intent.suggestedTemplate);
    }
    /**
     * Validate and normalize integration requirements against template capabilities
     */
    async validateIntegrations(template, requested) {
        const validated = {};
        // Process each integration type
        for (const [type, provider] of Object.entries(requested)) {
            if (!provider)
                continue;
            const supportedProviders = template.supportedIntegrations[type];
            if (supportedProviders && supportedProviders.includes(provider)) {
                // Requested provider is supported
                validated[type] = provider;
            }
            else if (template.defaultIntegrations[type]) {
                // Fall back to template default
                console.log(`[TemplateSelector] Integration ${type}:${provider} not supported, using default: ${template.defaultIntegrations[type]}`);
                validated[type] = template.defaultIntegrations[type];
            }
            else {
                console.warn(`[TemplateSelector] Integration ${type}:${provider} not supported and no default available`);
            }
        }
        // Ensure required integrations are present
        for (const requiredType of template.requiredIntegrations) {
            if (!validated[requiredType] && template.defaultIntegrations[requiredType]) {
                console.log(`[TemplateSelector] Adding required integration ${requiredType}:${template.defaultIntegrations[requiredType]}`);
                validated[requiredType] = template.defaultIntegrations[requiredType];
            }
        }
        return validated;
    }
}
