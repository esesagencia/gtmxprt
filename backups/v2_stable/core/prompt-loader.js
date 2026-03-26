import fs from 'fs/promises';
import path from 'path';

export async function loadSystemPrompt() {
    const promptPath = path.join(process.cwd(), 'prompts', 'GTMXPERT_SYSTEM_PROMPT.md');
    try {
        const content = await fs.readFile(promptPath, 'utf-8');
        return content;
    } catch (error) {
        console.error('Error loading system prompt:', error);
        throw error;
    }
}
