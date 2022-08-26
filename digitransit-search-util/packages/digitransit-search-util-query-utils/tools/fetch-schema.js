#!/usr/bin/env node
/* eslint-disable no-console, compat/compat */
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const GRAPHQL_SCHEMA_URL =
  'https://raw.githubusercontent.com/HSLdevcom/OpenTripPlanner/dev-2.x/src/ext/resources/legacygraphqlapi/schema.graphqls';
const OUTPUT_FILENAME = 'schema.graphql';

fetch(new URL(GRAPHQL_SCHEMA_URL), {
  headers: {
    Accept: 'text/plain',
  },
})
  .then(response => response.text())
  .then(text => {
    const output = path.join(__dirname, '../', OUTPUT_FILENAME);
    fs.writeFileSync(output, text);
    console.log(` ** GraphQL Schema saved to: ${output}`);
  })
  .catch(err => {
    console.error(err);
  });
