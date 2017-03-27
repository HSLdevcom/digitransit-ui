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

const dir = 'sass/themes/' + theme;
const name = theme.charAt(0).toUpperCase() + theme.slice(1); // with uppecase initial

if(!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

fs.writeFileSync(dir + '/main.scss',
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

$standalone-btn-color: $primary-color;

`;

let textLogo;

if (logoPath) {
  const logo = path.basename(logoPath);
  // copy logo
  fs.createReadStream(logoPath).pipe(fs.createWriteStream(dir + '/' + logo));

  // add logo definition to theme
  themeContent = themeContent + `$nav-logo: url('${logo}'); /* Navbar logo */`;
  textLogo = 'false';
} else {
  textLogo = 'true';
}

// theme is ready, write it
fs.writeFileSync(dir + '/_theme.scss', themeContent);

// generate app configuration
const regexColor = new RegExp('__color__', 'g');
const regexTheme = new RegExp('__theme__', 'g');
const regexName = new RegExp('__Theme__', 'g');
const regexLogo = new RegExp('__textlogo__', 'g');

let conf = fs.readFileSync('build/template.waltti.js', 'utf-8');
conf = conf.replace(regexColor, color).replace(regexTheme, theme)
           .replace(regexName, name).replace(regexLogo, textLogo);

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
