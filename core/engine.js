import 'dotenv/config';
import { loadSystemPrompt } from './prompt-loader.js';
import * as claude from './llm-adapters/claude.js';
import * as gemini from './llm-adapters/gemini.js';
import { slimHTML } from './slim-utils.js';

export async function generateImplementation(payload, retries = 3) {
    // 1. Load the system prompt
    const systemPrompt = await loadSystemPrompt();

    // 2. Validate payload (basic)
    if (!payload.client?.name || !payload.intent || !payload.captured?.click_element_html) {
        throw new Error('Invalid payload: client.name, intent, and captured.click_element_html are required.');
    }

    // 3. Slim down the HTML to save tokens and improve performance
    payload.captured.click_element_html = slimHTML(payload.captured.click_element_html);

    // 4. Select Provider
    const provider = process.env.LLM_PROVIDER === 'claude' ? claude : gemini;
    
    // 5. Call LLM with Retry
    console.log(`🚀 Calling LLM (${process.env.LLM_PROVIDER || 'gemini'})...`);
    
    let attempt = 0;
    let rawOutput = '';
    while (attempt < retries) {
        try {
            rawOutput = await provider.callLLM(systemPrompt, payload);
            break;
        } catch (error) {
            attempt++;
            const is503 = error.message.includes('503') || error.message.includes('Overloaded'); 
            if (attempt >= retries || !is503) {
                throw error;
            }
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`[ENGINE] LLM error, retrying in ${delay}ms (attempt ${attempt}/${retries})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // 6. Parse output
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
