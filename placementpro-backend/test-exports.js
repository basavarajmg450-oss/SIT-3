require('dotenv').config();
const { genAI } = require('@google/genai'); // Trying common export names

async function testNewSDK() {
    console.log('Testing @google/genai syntax...');
    try {
        console.log('Exports from @google/genai:', Object.keys(require('@google/genai')));
    } catch (e) {
        console.error('Import failed:', e.message);
    }
}
testNewSDK();
