import Anthropic from '@anthropic-ai/sdk';

export async function callLLM(systemPrompt, userPayload) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found in environment');

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
        model: process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: parseInt(process.env.LLM_MAX_TOKENS) || 4000,
        system: systemPrompt,
        messages: [{
            role: 'user',
            content: JSON.stringify(userPayload, null, 2)
        }]
    });

    return response.content[0].text;
}
