import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callLLM(systemPrompt, userPayload) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_API_KEY not found in environment');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Gemini Pro is recommended for large context (HTML analysis)
    const model = genAI.getGenerativeModel({
        model: process.env.LLM_MODEL || 'gemini-2.5-pro',
        systemInstruction: systemPrompt
    });

    const prompt = JSON.stringify(userPayload, null, 2);
    const result = await model.generateContent(prompt);
    
    return result.response.text();
}
