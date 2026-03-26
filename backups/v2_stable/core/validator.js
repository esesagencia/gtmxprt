export function validateOutput(structured) {
    const required = ['analysis', 'variables', 'trigger', 'tags', 'documentation'];
    const missing = required.filter(field => !structured[field]);

    if (missing.length > 0) {
        console.warn(`⚠️ Warning: Missing sections in LLM output: ${missing.join(', ')}`);
    }

    // Basic structure checks
    if (structured.analysis && (!structured.analysis.element_type || !structured.analysis.capture_strategy)) {
        console.warn('⚠️ Warning: analysis section is incomplete');
    }

    if (structured.tags && !Array.isArray(structured.tags)) {
        console.warn('⚠️ Warning: tags should be an array');
    }

    return missing.length === 0;
}
