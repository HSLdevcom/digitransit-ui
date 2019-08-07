/* eslint-disable */

const lang1 = process.env.LANG_FROM || process.argv[2] || 'fi';
const lang2 = process.env.LANG_TO || process.argv[3] || 'nb';

console.log("Comparing translations between " + lang1 + " and " + lang2);

const UI_PATH = process.env.UI_PATH || '.';
const FILE = UI_PATH + '/app/translations.js';

console.log("Using path: " + UI_PATH + " to file: " + FILE);

fs = require('fs');
const file = fs.readFileSync(FILE, 'utf8');
const start = file.indexOf("const translations = {") + 21;
const end = file.lastIndexOf("};") + 1;

const translations = eval('(' + file.substring(start, end) + ')');

const lang_from = translations[lang1];
const lang_to = translations[lang2];
if (!lang_from) {
  console.log(lang1 + ' does not exist in translations');
  process.exit();
}
if (!lang_to) {
  console.log(lang2 + ' does not exist in translations');
  process.exit();
}

const keys_from = Object.keys(lang_from).sort();
const keys_to = Object.keys(lang_to).sort();

const difference = keys_from.filter(x => !keys_to.includes(x));

console.log("The following keys are missing in translation: '" + lang2 + "'");
console.log(difference);
