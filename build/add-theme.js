/* eslint-disable */

/* initialize a skeleton for a new theme */
/* For example: npm run add-theme juupajoki 0x80CCAA */
const fs = require('fs');
const path = require('path');

const theme = process.argv[2];
const color = process.argv[3] || '$livi-blue';
const logoPath = process.argv[4] || 'sass/themes/default/digitransit-logo.png'; // source icon
const logo = path.basename(logoPath);

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
$secondary-color: darken($primary-color, 20%);
$hilight-color: ${color};
$action-color: ${color};
/* Navbar logo */
$nav-logo: url(${logo});
`);

// copy logo
fs.createReadStream(logo).pipe(fs.createWriteStream(dir + '/' + logo));

// generate app configuration
const regexColor = new RegExp('__color__', 'g');
const regexTheme = new RegExp('__theme__', 'g');
const regexName = new RegExp('__Theme__', 'g');

let conf = fs.readFileSync('build/template.waltti.js', "utf-8");
conf = conf.replace(regexColor, color).replace(regexTheme, theme).replace(regexName, name);
fs.writeFileSync('app/configurations/config.' + theme + '.js', conf);

console.log('Theme for ' + theme + ' created! Apply "git add" to join new components to the project. \n');
