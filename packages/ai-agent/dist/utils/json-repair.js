/**
 * JSON Repair Utility for AI Output
 *
 * Handles common issues with AI-generated JSON:
 * - Truncated output (unterminated strings, missing brackets)
 * - Extra text before/after JSON
 * - Common syntax errors
 */
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
    }
    // Step 2: Try parsing as-is first
    try {
        const data = JSON.parse(jsonText);
        return { success: true, data, repaired: repairs.length > 0, repairs };
    }
    catch (initialError) {
        // Continue with repairs
    }
    // Step 3: Fix common issues
    const fixers = [
        { name: "Remove trailing comma", fn: removeTrailingCommas },
        { name: "Close unterminated strings", fn: closeUnterminatedStrings },
        { name: "Balance brackets", fn: balanceBrackets },
        { name: "Fix truncated arrays", fn: fixTruncatedArrays },
        { name: "Remove control characters", fn: removeControlCharacters },
    ];
    let currentText = jsonText;
    for (const fixer of fixers) {
        const fixed = fixer.fn(currentText);
        if (fixed !== currentText) {
            repairs.push(fixer.name);
            currentText = fixed;
            // Try parsing after each fix
            try {
                const data = JSON.parse(currentText);
                return { success: true, data, repaired: true, repairs };
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
        try {
            const data = JSON.parse(aggressiveResult);
            return { success: true, data, repaired: true, repairs };
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
