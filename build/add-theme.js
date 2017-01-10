/* eslint-disable */


/* initialize a skeleton for a new theme */
/* For example: npm run add-theme tuppukylä */

const fs = require('fs');

const target = process.argv[2];
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
$primary-color: $livi-blue;
$secondary-color: #008bde;
$hilight-color: $livi-blue;
$action-color: $livi-blue;
`
);

console.log('Theme for ' + target + ' created!');
