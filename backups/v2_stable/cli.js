import fs from 'fs/promises';
import path from 'path';
import { generateImplementation } from './core/engine.js';
import { validateOutput } from './core/validator.js';

async function main() {
    const args = process.argv.slice(2);
    const inputIndex = args.indexOf('--input');

    if (inputIndex === -1) {
        console.log('Usage: node cli.js --input <path_to_json>');
        process.exit(1);
    }

    const inputPath = args[inputIndex + 1];

    try {
        const rawData = await fs.readFile(inputPath, 'utf-8');
        const payload = JSON.parse(rawData);

        console.log(`🧠 Processing implementation for: ${payload.client.name}...`);
        const result = await generateImplementation(payload);

        validateOutput(result);

        const outputPath = path.join(process.cwd(), 'outputs', `result-${Date.now()}.json`);
        await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

        console.log(`✅ Success! Output saved to: ${outputPath}`);
        console.log('\n--- ANALYSIS ---');
        console.log(result.analysis.capture_strategy);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
