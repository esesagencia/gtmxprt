import 'dotenv/config';
import { loadSystemPrompt } from './prompt-loader.js';
import * as claude from './llm-adapters/claude.js';
import * as gemini from './llm-adapters/gemini.js';

export async function generateImplementation(payload) {
    // 1. Load the system prompt
    const systemPrompt = await loadSystemPrompt();

    // 2. Validate payload (basic)
    if (!payload.client?.name || !payload.intent || !payload.captured?.click_element_html) {
        throw new Error('Invalid payload: client.name, intent, and captured.click_element_html are required.');
    }

    // 3. Select Provider (Always Gemini if provider not explicitly set to claude)
    const provider = process.env.LLM_PROVIDER === 'claude' ? claude : gemini;
    
    // 4. Call LLM
    console.log(`🚀 Calling LLM (${process.env.LLM_PROVIDER || 'gemini'})...`);
    const rawOutput = await provider.callLLM(systemPrompt, payload);

    // 4. Parse output
    const structured = parseOutput(rawOutput);

    return structured;
}

function parseOutput(raw) {
    // Try direct parse
    try { return JSON.parse(raw); } catch (e) { }

    // Extract from markdown fences
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
        try { return JSON.parse(match[1]); } catch (e) { }
    }

    // Last resort: find braces
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
        try { return JSON.parse(raw.substring(start, end + 1)); } catch (e) { }
    }

    throw new Error('Failed to parse LLM output as valid JSON');
}
