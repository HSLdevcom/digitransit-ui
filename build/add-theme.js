/* eslint-disable */

/* initialize a skeleton for a new theme */
/* For example: npm run add-theme juupajoki 0x80CCAA */
const fs = require('fs');

const theme = process.argv[2];
const color = process.argv[3] || '$livi-blue';

console.log(color);

if (!theme || theme === '?') {
  console.log('Usage: npm run add-theme <name> <optional theme hex color> \n');
  process.exit(0);
}

const dir = 'sass/themes/' + theme;
const name = theme.charAt(0).toUpperCase() + theme.slice(1); // with uppecase initial

if(!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

fs.writeFileSync(dir + '/main.scss',
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
  fs.createWriteStream('static/browserconfig.' + theme + '.xml'));

// copy logo
fs.createReadStream('sass/themes/default/digitransit-logo.png').pipe(
  fs.createWriteStream(dir + '/digitransit-logo.png'));

// copy sprites
fs.createReadStream('static/svg-sprite.default.svg').pipe(
  fs.createWriteStream('static/svg-sprite.' + theme + '.svg'));

// generate manifest
let manifest = require('../static/manifest.default.json');
manifest.name = name + ' Digitransit';
manifest.background_color = color;
manifest.theme_color = color;

fs.writeFileSync('static/manifest.' + theme + '.json', JSON.stringify(manifest, null, 2));

// generate app configuration
const regexColor = new RegExp('__color__', 'g');
const regexTheme = new RegExp('__theme__', 'g');
const regexName = new RegExp('__Theme__', 'g');

let conf = fs.readFileSync('app/template.waltti.js', "utf-8");
conf = conf.replace(regexColor, color).replace(regexTheme, theme).replace(regexName, name);
fs.writeFileSync('app/config.' + theme + '.js', conf);

console.log('Theme for ' + theme + ' created! Apply "git add" to join new components to the project. /n');
