/* eslint-disable */

/* initialize a skeleton for a new theme */
/* For example: npm run add-theme juupajoki 0x80CCAA */
const fs = require('fs');
const path = require('path');

const theme = process.argv[2];
const color = process.argv[3] || '$livi-blue';
const logoPath = process.argv[4];

if (!theme || theme === '?') {
  console.log('Usage: npm run add-theme <name> <optional hex color (with quotes!)> <optional logo image> \n');
  process.exit(0);
}

const sassDir = 'sass/themes/' + theme;
const name = theme.charAt(0).toUpperCase() + theme.slice(1); // with uppecase initial
if(!fs.existsSync(sassDir)) {
  fs.mkdirSync(sassDir);
}

fs.writeFileSync(sassDir + '/main.scss',
`@import 'theme';
@import '../../main';
`
);

let themeContent =
`@import '../../base/waltti';

/* main theme colors */
$primary-color: ${color};
$secondary-color: darken($primary-color, 20%);
$hilight-color: $primary-color;
$action-color: $primary-color;
$bus-color: $primary-color;
$viewpoint-marker-color: $primary-color;
$current-location-color: $primary-color;

$standalone-btn-color: $primary-color;
$link-color: $primary-color;

/* Component palette */
$desktop-title-color: $primary-color;
$desktop-title-arrow-icon-color: $secondary-color;
`;

let textLogo;
let logo;
if (logoPath) {
  logo = path.basename(logoPath);
  const imageDir = 'app/configurations/images/' + theme;
  if(!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }
  // copy logo
  fs.createReadStream(logoPath).pipe(fs.createWriteStream(imageDir + '/' + logo));

  textLogo = 'false';
} else {
  textLogo = 'true';
}

// theme is ready, write it
fs.writeFileSync(sassDir + '/_theme.scss', themeContent);

// generate app configuration
const regexColor = new RegExp('__color__', 'g');
const regexTheme = new RegExp('__theme__', 'g');
const regexName = new RegExp('__Theme__', 'g');
const regexLogo = new RegExp('__textlogo__,', 'g');

let conf = fs.readFileSync('build/template.waltti.js', 'utf-8');
conf = conf.replace(regexColor, color).replace(regexTheme, theme)
           .replace(regexName, name)
if (textLogo === 'true') {
  conf = conf.replace(regexLogo, 'true,');
} else {
  conf = conf.replace(regexLogo, `false,\n\n  logo: '${theme}/${logo}',`);
}

fs.writeFileSync('app/configurations/config.' + theme + '.js', conf);

// update host name mapping
const defaultConfName = 'app/configurations/config.default.js';
const appendAfter = `matka: 'matka',`;

conf = fs.readFileSync(defaultConfName, 'utf-8');
conf = conf.replace(appendAfter, appendAfter +
`
    ${theme}: '${theme}',`);

fs.writeFileSync(defaultConfName, conf);

console.log('Theme for ' + theme + ' created! Apply "git add" to join new components to the project. \n');
