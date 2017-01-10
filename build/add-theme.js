/* eslint-disable */

/* initialize a skeleton for a new theme */
/* For example: npm run add-theme tuppukylä 0x80CCAA */
const fs = require('fs');

const target = process.argv[2];
const color = process.argv[3] || '$livi-blue';

if (!target || target === '?') {
  console.log('Usage: npm run add-theme <name> <optional theme hex color>');
  process.exit(0);
}

const dir = 'sass/themes/' + target;

fs.mkdirSync(dir);

fs.writeFileSync(dir + '/_main.scss',
`@import 'theme';
@import '../../main';
@import 'icon';
`
);

fs.writeFileSync(
  dir + '/_icon.scss',
  `@import '../default/icon';`
);

fs.writeFileSync(dir + '/_theme.scss',
`@import '../default/theme';

/* main theme colors */
$primary-color: ${color};
$secondary-color: #008bde;
$hilight-color: ${color};
$action-color: ${color};
`);

// copy default browserconfig
fs.createReadStream('static/browserconfig.default.xml').pipe(
  fs.createWriteStream('static/browserconfig.' + target + '.xml'));

// generate manifest
let manifest = require('../static/manifest.default.json');
manifest.name = target.charAt(0).toUpperCase() + target.slice(1) + ' Digitransit';
manifest.background_color = color;
manifest.theme_color = color;

fs.writeFileSync('static/manifest.' + target + '.json', JSON.stringify(manifest, null, 2));

console.log('Theme for ' + target + ' created! Apply "git add" to join new components to the project.');
