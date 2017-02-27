/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const introspectionQuery = require('graphql/utilities/introspectionQuery').introspectionQuery;
const fetch = require('node-fetch');

const outputFilename = 'schema.json';

fetch(`${process.env.SERVER_ROOT || 'https://dev-api.digitransit.fi/routing/v1'}/routers/hsl/index/graphql`, {
  method: 'post',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: introspectionQuery,
  }),
}).then((response) => {
  console.log(response.headers);
  return response.json();
}).then((json) => {
  fs.writeFile(outputFilename, JSON.stringify(json.data, null, 4), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`JSON saved to ${outputFilename}`);
    }
  });
}).catch((err) => {
  console.log(err);
});
