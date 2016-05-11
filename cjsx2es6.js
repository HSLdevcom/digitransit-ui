/* eslint no-console: 0 */
const cjsxTransform = require('coffee-react-transform');
const decaf = require('decafjs');
const babel = require('babel-core');
const esnext = require('esnext');
const fs = require('fs');

fs.readFile(
  process.argv[2], (err, file) => {
    console.log(
      esnext.convert(
        babel.transform(
          decaf.compile(
            cjsxTransform(
              file.toString()
            )
          )
          , {
            plugins: ['transform-react-createelement-to-jsx', 'syntax-class-properties'],
          }
        ).code
      ).code
    );
  }
);
