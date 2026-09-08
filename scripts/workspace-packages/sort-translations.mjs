#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Sorts and checks digitransit-component packages' own translation bundles
 * (`src/{helpers,utils}/translations.js`) - a different shape from
 * `app/translations/*.js` (handled separately by ../sort-translations.mjs):
 * one file per package holding EVERY locale, each nested under an i18next
 * `translation` namespace, e.g.
 *
 *   const translations = {
 *     en: { translation: { cancel: 'Cancel', ... } },
 *     fi: { translation: { cancel: 'Peruuta', ... } },
 *   };
 *   export default translations;
 *
 * Two modes, mirroring eslint/eslint-fix:
 *
 *   node sort-translations.mjs         check mode (read-only): reports
 *     unsorted keys and cross-locale key-parity mismatches, exits non-zero
 *     if anything is found. Wired into `yarn lint`.
 *
 *   node sort-translations.mjs --fix   rewrites each file with locales and
 *     each locale's keys sorted alphabetically. Parity mismatches can't be
 *     auto-fixed (a human has to decide the correct key/translation), so
 *     they're still reported and still fail the run, same as `eslint --fix`
 *     exiting non-zero on unfixable errors. Wired into `yarn format`.
 */
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const PACKAGES_DIR = path.join(repoRoot, 'digitransit-component/packages');
const PRINT_WIDTH = 80;
const SORT_KEYS_PRAGMA = '/* eslint sort-keys: "error" */';

// Mirrors generate-readmes.mjs's findEntryPoint: a fixed candidate list
// rather than a recursive glob, since every package that has one of these
// keeps it at one of exactly two spots.
const CANDIDATE_RELATIVE_PATHS = [
  'src/helpers/translations.js',
  'src/utils/translations.js',
];

function findTranslationsFiles() {
  return fs
    .readdirSync(PACKAGES_DIR)
    .flatMap(entry =>
      CANDIDATE_RELATIVE_PATHS.map(relative =>
        path.join(PACKAGES_DIR, entry, relative),
      ),
    )
    .filter(fullPath => fs.existsSync(fullPath))
    .sort();
}

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

function isSorted(keys) {
  return keys.every((key, i) => i === 0 || keys[i - 1] <= key);
}

// Only fi/sv/en are required to be in parity, mirroring
// test/unit/translations.test.js's own scope for app/translations - de/pl
// (etc.) coverage is incomplete today across most of these files and isn't
// enforced.
const PARITY_LOCALES = ['fi', 'sv', 'en'];

// Reports, for every key that doesn't appear in ALL of a file's fi/sv/en
// locales, which of those locales have it and which are missing it -
// catches both a locale missing a translation and a typo'd key that only
// one locale has (e.g. a 'required-field' sitting next to every other
// locale's 'required-text').
function findParityMismatches(translations) {
  const locales = Object.keys(translations).filter(locale =>
    PARITY_LOCALES.includes(locale),
  );
  const localesByKey = new Map();
  locales.forEach(locale => {
    Object.keys(translations[locale].translation).forEach(key => {
      if (!localesByKey.has(key)) {
        localesByKey.set(key, []);
      }
      localesByKey.get(key).push(locale);
    });
  });

  return [...localesByKey.entries()]
    .filter(([, present]) => present.length !== locales.length)
    .map(([key, present]) => ({
      key,
      present,
      missing: locales.filter(locale => !present.includes(locale)),
    }));
}

// Sorted locales + each locale's sorted translation keys, formatted to
// match the existing style of these files (const + named export, 2-space
// nesting per level), reusing ../sort-translations.mjs's key/value
// formatting and line-wrapping.
function sortedFileContent(translations) {
  const lines = [];
  lines.push(SORT_KEYS_PRAGMA);
  lines.push('const translations = {');

  Object.keys(translations)
    .sort()
    .forEach(locale => {
      lines.push(`  ${formatKey(locale)}: {`);
      lines.push('    translation: {');

      const { translation } = translations[locale];
      Object.keys(translation)
        .sort()
        .forEach(key => {
          const formattedKey = formatKey(key);
          const formattedValue = formatValue(translation[key]);
          const singleLine = `      ${formattedKey}: ${formattedValue},`;
          if (singleLine.length <= PRINT_WIDTH) {
            lines.push(singleLine);
          } else {
            lines.push(`      ${formattedKey}:`);
            lines.push(`        ${formattedValue},`);
          }
        });

      lines.push('    },');
      lines.push('  },');
    });

  lines.push('};');
  lines.push('');
  lines.push('export default translations;');
  lines.push('');

  return lines.join('\n');
}

async function checkFile(filePath, fix) {
  const module = await import(filePath);
  const translations = module.default;
  const relativePath = path.relative(repoRoot, filePath);

  const locales = Object.keys(translations);
  const sortIssues = [];
  if (!isSorted(locales)) {
    sortIssues.push('locales are not sorted alphabetically');
  }
  locales.forEach(locale => {
    if (!isSorted(Object.keys(translations[locale].translation))) {
      sortIssues.push(`'${locale}' translation keys are not sorted`);
    }
  });

  const parityMismatches = findParityMismatches(translations);

  if (sortIssues.length === 0 && parityMismatches.length === 0) {
    return false;
  }

  console.log(relativePath);
  if (fix && sortIssues.length > 0) {
    fs.writeFileSync(filePath, sortedFileContent(translations), 'utf-8');
    console.log('  fixed:', sortIssues.join(', '));
  } else {
    sortIssues.forEach(issue => console.log(`  ${issue}`));
  }
  parityMismatches.forEach(({ key, present, missing }) => {
    console.log(
      `  key '${key}' present in [${present.join(
        ', ',
      )}], missing in [${missing.join(', ')}]`,
    );
  });

  // Parity mismatches always fail the run, fixed or not - there's no
  // automatic fix for a missing/mistyped translation key.
  return parityMismatches.length > 0 || (!fix && sortIssues.length > 0);
}

async function main() {
  const fix = process.argv.includes('--fix');
  console.log(
    `---------- Running sort-translations.mjs script (${
      fix ? '--fix' : 'check'
    }) ----------`,
  );

  const files = findTranslationsFiles();
  const results = [];
  for (let i = 0; i < files.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await checkFile(files[i], fix));
  }

  if (results.some(Boolean)) {
    process.exitCode = 1;
  } else {
    console.log(
      'All component package translations are sorted and consistent.',
    );
  }
}

main();
