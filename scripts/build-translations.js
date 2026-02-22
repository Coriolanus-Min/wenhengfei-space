/**
 * Pre-translate all data-translate texts from HTML files.
 * Run: node scripts/build-translations.js
 * Outputs: data/translations-zh.json
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const ROOT = path.resolve(__dirname, '..');
const HTML_FILES = ['index.html', 'work.html', 'portfolio.html', 'hobbies.html', 'articles.html', 'contact.html'];
const OUTPUT = path.join(ROOT, 'data', 'translations-zh.json');

// Extract data-translate key and text from HTML
function extractTranslations() {
    const entries = {};
    const regex = /data-translate="([^"]+)"[^>]*>([^<]+)/g;

    for (const file of HTML_FILES) {
        const html = fs.readFileSync(path.join(ROOT, file), 'utf-8');
        let match;
        while ((match = regex.exec(html)) !== null) {
            const key = match[1];
            let text = match[2].trim();
            // Decode HTML entities
            text = text.replace(/&copy;/g, '\u00A9').replace(/&amp;/g, '&');
            if (text && !entries[key]) {
                entries[key] = text;
            }
        }
    }
    return entries;
}

// Translate all texts via DeepL in one batch
async function translateBatch(texts) {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) throw new Error('DEEPL_API_KEY not set in .env');

    const isFree = process.env.DEEPL_FREE_ACCOUNT === 'true';
    const baseUrl = isFree
        ? 'https://api-free.deepl.com/v2/translate'
        : 'https://api.deepl.com/v2/translate';

    const response = await axios.post(baseUrl,
        { text: texts, target_lang: 'ZH' },
        {
            headers: {
                'Authorization': `DeepL-Auth-Key ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    );

    return response.data.translations.map(t => t.text);
}

async function main() {
    // 1. Extract
    const entries = extractTranslations();
    const keys = Object.keys(entries);
    const texts = Object.values(entries);

    console.log(`Found ${keys.length} translatable texts across ${HTML_FILES.length} files`);
    console.log(`Total characters: ${texts.join('').length}`);

    // 2. Load existing translations to avoid re-translating unchanged text
    let existing = {};
    if (fs.existsSync(OUTPUT)) {
        existing = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
    }

    // Find texts that are new or changed
    const toTranslate = [];
    const toTranslateKeys = [];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (existing[key] && existing[key]._source === texts[i]) {
            // Source text unchanged, keep existing translation
            continue;
        }
        toTranslate.push(texts[i]);
        toTranslateKeys.push(key);
    }

    if (toTranslate.length === 0) {
        console.log('All translations are up to date. Nothing to do.');
        return;
    }

    console.log(`${toTranslate.length} texts need translation (${keys.length - toTranslate.length} cached)`);

    // 3. Translate
    console.log('Calling DeepL API...');
    const translated = await translateBatch(toTranslate);

    // 4. Merge results
    const result = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const idx = toTranslateKeys.indexOf(key);
        if (idx !== -1) {
            result[key] = { zh: translated[idx], _source: texts[i] };
        } else {
            result[key] = existing[key];
        }
    }

    // 5. Write output
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Wrote ${keys.length} translations to ${OUTPUT}`);
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
