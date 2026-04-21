#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

const TRANSLATIONS_DIR = path.resolve(
  import.meta.dirname,
  '../app/translations',
);
const PRINT_WIDTH = 80;

function needsQuoting(key) {
  return !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
}

function formatKey(key) {
  return needsQuoting(key) ? `'${key}'` : key;
}

function formatValue(value) {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  // Use double quotes when value contains a single quote to avoid escaping
  if (escaped.includes("'")) {
    return `"${escaped.replace(/"/g, '\\"')}"`;
  }
  return `'${escaped}'`;
}

function sortedTranslationsFileContent(lang, translations) {
  const lines = [];
  lines.push('/* eslint sort-keys: "error" */');
  lines.push('export default {');
  lines.push(`  ${formatKey(lang)}: {`);

  const keys = Object.keys(translations).sort();
  for (let j = 0; j < keys.length; j++) {
    const key = keys[j];
    const formattedKey = formatKey(key);
    const formattedValue = formatValue(translations[key]);
    const singleLine = `    ${formattedKey}: ${formattedValue},`;
    if (singleLine.length <= PRINT_WIDTH) {
      lines.push(singleLine);
    } else {
      lines.push(`    ${formattedKey}:`);
      lines.push(`      ${formattedValue},`);
    }
  }

  lines.push('  },');
  lines.push('};');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  try {
    console.log('---------- Running sort-translations.mjs script ----------');

    const files = fs
      .readdirSync(TRANSLATIONS_DIR)
      .filter(f => f.endsWith('.js'))
      .sort();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(TRANSLATIONS_DIR, file);
      console.log('Processing file', filePath);
      // eslint-disable-next-line no-await-in-loop
      const module = await import(filePath);
      const langData = module.default;
      const lang = Object.keys(langData)[0];
      const sorted = sortedTranslationsFileContent(lang, langData[lang]);

      try {
        fs.writeFileSync(filePath, sorted, 'utf-8');
        console.log('Sorted translations written to', filePath);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `Failed to write sorted translations to ${filePath}: ${message}`,
        );
        process.exitCode = 1;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to process translations: ${message}`);
    process.exitCode = 1;
  }
}

main();
