'use strict';

const fs = require('fs');
const introspectionQuery = require('graphql/utilities/introspectionQuery').introspectionQuery;
const fetch = require('node-fetch');
const outputFilename = 'schema.json';

fetch((process.env.SERVER_ROOT || 'http://matka.hsl.fi') + '/otp/routers/default/index/graphql', {
  method: 'post',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: introspectionQuery,
  }),
}).then((response) => {
  return response.json();
}).then((json) => {
  fs.writeFile(outputFilename, JSON.stringify(json.data, null, 4), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('JSON saved to ' + outputFilename);
    }
  });
});
