/**
 * JSON Repair Utility for AI Output
 *
 * Handles common issues with AI-generated JSON:
 * - Truncated output (unterminated strings, missing brackets)
 * - Extra text before/after JSON
 * - Common syntax errors
 */
/**
 * Valid enum values for schema normalization
 * Haiku often returns invalid values like "supabase(auth)" instead of "supabase"
 */
const VALID_ENUMS = {
    // Template/category enums
    suggestedTemplate: ["saas", "landing-page", "dashboard", "blog", "directory", "ecommerce"],
    category: ["saas", "landing-page", "dashboard", "blog", "directory", "ecommerce"],
    // Integration provider enums
    auth: ["supabase", "clerk"],
    payments: ["stripe", "paddle"],
    email: ["resend", "sendgrid"],
    db: ["supabase", "planetscale"],
    ai: ["openai", "anthropic"],
    analytics: ["posthog", "plausible"],
    // Complexity enum
    complexity: ["simple", "moderate", "complex"],
    // Architecture schema enums
    method: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    type: ["ui", "feature", "layout"],
    routeType: ["page", "api"],
    template: ["create-new", "use-existing"],
    // Layout enum for pages
    layout: ["default", "dashboard", "auth", "minimal", "full-width"],
};
let _repairMetrics = {
    enumNormalizations: 0,
    jsonExtractions: 0,
    truncationRepairs: 0,
    bracketBalances: 0,
};
/**
 * Get current repair metrics
 */
export function getRepairMetrics() {
    return { ..._repairMetrics };
}
/**
 * Reset repair metrics (useful for testing)
 */
export function resetRepairMetrics() {
    _repairMetrics = {
        enumNormalizations: 0,
        jsonExtractions: 0,
        truncationRepairs: 0,
        bracketBalances: 0,
    };
}
/**
 * Attempt to parse and repair malformed JSON from AI output
 *
 * @param text - Raw AI output text
 * @returns Parsed data or error information
 */
export function repairAndParseJSON(text) {
    const repairs = [];
    // Step 1: Extract JSON from surrounding text
    let jsonText = extractJSON(text);
    if (jsonText !== text) {
        repairs.push("Extracted JSON from surrounding text");
        _repairMetrics.jsonExtractions++;
    }
    // Step 2: Try parsing as-is first
    try {
        const data = JSON.parse(jsonText);
        // Normalize enum values before returning
        const enumRepairCountBefore = repairs.length;
        const normalized = normalizeEnumValues(data, repairs);
        if (repairs.length > enumRepairCountBefore) {
            _repairMetrics.enumNormalizations++;
        }
        return { success: true, data: normalized, repaired: repairs.length > 0, repairs };
    }
    catch {
        // Continue with repairs
    }
    // Step 3: Fix common issues
    const fixers = [
        { name: "Remove trailing comma", fn: removeTrailingCommas, metric: null },
        { name: "Close unterminated strings", fn: closeUnterminatedStrings, metric: "truncationRepairs" },
        { name: "Balance brackets", fn: balanceBrackets, metric: "bracketBalances" },
        { name: "Fix truncated arrays", fn: fixTruncatedArrays, metric: "truncationRepairs" },
        { name: "Remove control characters", fn: removeControlCharacters, metric: null },
    ];
    let currentText = jsonText;
    for (const fixer of fixers) {
        const fixed = fixer.fn(currentText);
        if (fixed !== currentText) {
            repairs.push(fixer.name);
            if (fixer.metric) {
                _repairMetrics[fixer.metric]++;
            }
            currentText = fixed;
            // Try parsing after each fix
            try {
                const data = JSON.parse(currentText);
                const enumRepairCountBefore = repairs.length;
                const normalized = normalizeEnumValues(data, repairs);
                if (repairs.length > enumRepairCountBefore) {
                    _repairMetrics.enumNormalizations++;
                }
                return { success: true, data: normalized, repaired: true, repairs };
            }
            catch {
                // Continue with next fixer
            }
        }
    }
    // Step 4: Final attempt - aggressive repair
    const aggressiveResult = aggressiveRepair(currentText);
    if (aggressiveResult) {
        repairs.push("Aggressive truncation repair");
        _repairMetrics.truncationRepairs++;
        try {
            const data = JSON.parse(aggressiveResult);
            const enumRepairCountBefore = repairs.length;
            const normalized = normalizeEnumValues(data, repairs);
            if (repairs.length > enumRepairCountBefore) {
                _repairMetrics.enumNormalizations++;
            }
            return { success: true, data: normalized, repaired: true, repairs };
        }
        catch {
            // Fall through to error
        }
    }
    // Failed to repair
    return {
        success: false,
        error: `Failed to parse JSON after repairs: ${repairs.join(", ")}`,
        repaired: false,
        repairs,
    };
}
/**
 * Extract JSON object/array from surrounding text
 */
function extractJSON(text) {
    // Find first { or [
    const objStart = text.indexOf("{");
    const arrStart = text.indexOf("[");
    let start = -1;
    let isObject = true;
    if (objStart === -1 && arrStart === -1) {
        return text; // No JSON found
    }
    else if (objStart === -1) {
        start = arrStart;
        isObject = false;
    }
    else if (arrStart === -1) {
        start = objStart;
    }
    else {
        start = Math.min(objStart, arrStart);
        isObject = objStart < arrStart;
    }
    // Find matching closing bracket
    const openChar = isObject ? "{" : "[";
    const closeChar = isObject ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = start;
    for (let i = start; i < text.length; i++) {
        const char = text[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === "\\") {
            escaped = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (inString)
            continue;
        if (char === openChar) {
            depth++;
        }
        else if (char === closeChar) {
            depth--;
            if (depth === 0) {
                end = i;
                break;
            }
        }
    }
    // If we didn't find a complete match, take everything from start
    if (depth !== 0) {
        return text.substring(start);
    }
    return text.substring(start, end + 1);
}
/**
 * Remove trailing commas before } or ]
 */
function removeTrailingCommas(text) {
    return text.replace(/,(\s*[}\]])/g, "$1");
}
/**
 * Close unterminated string literals
 */
function closeUnterminatedStrings(text) {
    let result = text;
    let inString = false;
    let stringStart = -1;
    let escaped = false;
    for (let i = 0; i < result.length; i++) {
        const char = result[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === "\\") {
            escaped = true;
            continue;
        }
        if (char === '"') {
            if (inString) {
                inString = false;
                stringStart = -1;
            }
            else {
                inString = true;
                stringStart = i;
            }
        }
    }
    // If we ended inside a string, close it
    if (inString && stringStart !== -1) {
        // Find a good place to close (before newline or end)
        const remaining = result.substring(stringStart);
        const newlinePos = remaining.indexOf("\n");
        if (newlinePos > 0) {
            result = result.substring(0, stringStart + newlinePos) + '"' + result.substring(stringStart + newlinePos);
        }
        else {
            result = result + '"';
        }
    }
    return result;
}
/**
 * Balance unmatched brackets
 */
function balanceBrackets(text) {
    let result = text;
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escaped = false;
    for (const char of result) {
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === "\\") {
            escaped = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (inString)
            continue;
        if (char === "{")
            braceCount++;
        else if (char === "}")
            braceCount--;
        else if (char === "[")
            bracketCount++;
        else if (char === "]")
            bracketCount--;
    }
    // Add missing closing brackets
    while (bracketCount > 0) {
        result += "]";
        bracketCount--;
    }
    while (braceCount > 0) {
        result += "}";
        braceCount--;
    }
    return result;
}
/**
 * Fix truncated arrays (remove incomplete last element)
 */
function fixTruncatedArrays(text) {
    // Look for patterns like: [..., "incomplete or [..., {incomplete
    const patterns = [
        /,\s*"[^"]*$/g, // Incomplete string at end
        /,\s*\{[^}]*$/g, // Incomplete object at end
        /,\s*\[[^\]]*$/g, // Incomplete array at end
    ];
    let result = text;
    for (const pattern of patterns) {
        result = result.replace(pattern, "");
    }
    return result;
}
/**
 * Remove control characters that break JSON parsing
 */
function removeControlCharacters(text) {
    // Remove control chars except tab, newline, carriage return
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}
/**
 * Aggressive repair for severely truncated JSON
 * Removes the last incomplete property/element
 */
function aggressiveRepair(text) {
    // Try progressively removing content from the end
    let result = text.trim();
    // Remove incomplete last property: "key": "val... or "key": {...
    const lastPropPattern = /,?\s*"[^"]*"\s*:\s*(?:"[^"]*|[\[{][^\]}]*)?$/;
    result = result.replace(lastPropPattern, "");
    // Balance and try
    result = balanceBrackets(result);
    // Ensure it ends properly
    if (!result.endsWith("}") && !result.endsWith("]")) {
        return null;
    }
    return result;
}
/**
 * Normalize enum values that Haiku often gets wrong
 * e.g., "supabase(auth+db)" → "supabase", "local" → null
 */
function normalizeEnumValues(data, repairs) {
    if (data === null || data === undefined)
        return data;
    if (typeof data !== "object")
        return data;
    if (Array.isArray(data))
        return data.map(item => normalizeEnumValues(item, repairs));
    const obj = data;
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === "integrations" && typeof value === "object" && value !== null) {
            // Normalize integration enum values
            const integrations = value;
            const normalizedIntegrations = {};
            for (const [intKey, intValue] of Object.entries(integrations)) {
                const validValues = VALID_ENUMS[intKey];
                if (validValues) {
                    if (typeof intValue === "string") {
                        const normalized = normalizeToEnum(intValue, validValues);
                        if (normalized !== intValue) {
                            repairs.push(`Normalized ${intKey}: "${intValue}" → ${normalized === null ? "null" : `"${normalized}"`}`);
                        }
                        normalizedIntegrations[intKey] = normalized;
                    }
                    else if (intValue === true) {
                        // Haiku sometimes returns true instead of provider name - use first valid option
                        const defaultValue = validValues[0];
                        repairs.push(`Normalized ${intKey}: true → "${defaultValue}"`);
                        normalizedIntegrations[intKey] = defaultValue;
                    }
                    else if (intValue === false || intValue === null) {
                        normalizedIntegrations[intKey] = null;
                    }
                    else {
                        normalizedIntegrations[intKey] = null;
                    }
                }
                else {
                    normalizedIntegrations[intKey] = intValue;
                }
            }
            result[key] = normalizedIntegrations;
        }
        else if (key === "suggestedTemplate" && typeof value === "string") {
            const normalized = normalizeToEnum(value, VALID_ENUMS.suggestedTemplate);
            if (normalized !== value) {
                repairs.push(`Normalized suggestedTemplate: "${value}" → "${normalized || "saas"}"`);
            }
            result[key] = normalized || "saas"; // Default to saas if invalid
        }
        else if (key === "category" && typeof value === "string") {
            const normalized = normalizeToEnum(value, VALID_ENUMS.category);
            if (normalized !== value) {
                repairs.push(`Normalized category: "${value}" → "${normalized || "saas"}"`);
            }
            result[key] = normalized || "saas"; // Default to saas if invalid
        }
        else if (key === "layout" && typeof value === "string") {
            const normalized = normalizeToEnum(value, VALID_ENUMS.layout);
            if (normalized !== value) {
                repairs.push(`Normalized layout: "${value}" → "${normalized || "default"}"`);
            }
            result[key] = normalized || "default"; // Default to default if invalid
        }
        else if (key === "complexity" && typeof value === "string") {
            const normalized = normalizeToEnum(value, VALID_ENUMS.complexity);
            if (normalized !== value) {
                repairs.push(`Normalized complexity: "${value}" → "${normalized || "moderate"}"`);
            }
            result[key] = normalized || "moderate";
        }
        else if (key === "method" && typeof value === "string") {
            // Normalize HTTP methods (GET, POST, etc.)
            const normalized = normalizeToEnum(value.toUpperCase(), VALID_ENUMS.method);
            if (normalized !== value.toUpperCase()) {
                repairs.push(`Normalized method: "${value}" → "${normalized || "GET"}"`);
            }
            result[key] = normalized || "GET";
        }
        else if (key === "routes" && Array.isArray(value)) {
            // Normalize route objects
            result[key] = value.map((route) => normalizeEnumValues(route, repairs));
        }
        else if (key === "components" && Array.isArray(value)) {
            // Normalize component objects
            result[key] = value.map((comp) => normalizeEnumValues(comp, repairs));
        }
        else if (key === "type" && typeof value === "string" && obj["path"] !== undefined) {
            // This is a route type (page|api)
            const normalized = normalizeToEnum(value, VALID_ENUMS.routeType);
            if (normalized !== value) {
                repairs.push(`Normalized routeType: "${value}" → "${normalized || "api"}"`);
            }
            result[key] = normalized || "api";
        }
        else if (key === "type" && typeof value === "string" && obj["name"] !== undefined) {
            // This is a component type (ui|feature|layout)
            const normalized = normalizeToEnum(value, VALID_ENUMS.type);
            if (normalized !== value) {
                repairs.push(`Normalized componentType: "${value}" → "${normalized || "ui"}"`);
            }
            result[key] = normalized || "ui";
        }
        else if (key === "template" && typeof value === "string" && obj["name"] !== undefined) {
            // This is a component template (create-new|use-existing)
            const normalized = normalizeToEnum(value, VALID_ENUMS.template);
            if (normalized !== value) {
                repairs.push(`Normalized template: "${value}" → "${normalized || "create-new"}"`);
            }
            result[key] = normalized || "create-new";
        }
        else if (typeof value === "object") {
            result[key] = normalizeEnumValues(value, repairs);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Try to extract a valid enum value from a potentially malformed string
 * e.g., "supabase(auth+db)" → "supabase", "supabase" → "supabase"
 */
function normalizeToEnum(value, validValues) {
    if (!value)
        return null;
    // Direct match
    const lower = value.toLowerCase().trim();
    const directMatch = validValues.find(v => v.toLowerCase() === lower);
    if (directMatch)
        return directMatch;
    // Check if value starts with a valid enum (handles "supabase(auth)" → "supabase")
    for (const valid of validValues) {
        if (lower.startsWith(valid.toLowerCase())) {
            return valid;
        }
    }
    // Check if valid enum appears anywhere in the value
    for (const valid of validValues) {
        if (lower.includes(valid.toLowerCase())) {
            return valid;
        }
    }
    // Invalid value - return null (will be treated as "no integration")
    return null;
}
