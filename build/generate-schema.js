/* eslint-disable import/no-extraneous-dependencies, no-console */
const fs = require('fs');
const fetch = require('node-fetch');
const http = require('https');
const { getIntrospectionQuery } = require('graphql');

const introspectionQuery = getIntrospectionQuery();
const outputJsonFilename = 'schema.json';
const graphqlSchemaSource =
  process.env.SCHEMA_SRC ||
  'https://raw.githubusercontent.com/HSLdevcom/OpenTripPlanner/dev-2.x/src/ext/resources/legacygraphqlapi/schema.graphqls';
const outputGraphQLFilename = 'schema.graphql';
const outputGraphQLFileCopy = `../digitransit-search-util/packages/digitransit-search-util-query-utils/schema/${outputGraphQLFilename}`;

const copySchema = (src, dest) => {
  fs.copyFile(src, dest, err => {
    if (err) {
      throw err;
    }
    console.log(`${src} was copied to ${dest}`);
  });
};

fetch(
  `${
    process.env.SERVER_ROOT || 'https://dev-api.digitransit.fi/routing/v2'
  }/routers/hsl/index/graphql`,
  {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: introspectionQuery,
    }),
  },
)
  .then(response => {
    console.log(response.headers);
    return response.json();
  })
  .then(json => {
    fs.writeFile(outputJsonFilename, JSON.stringify(json, null, 4), err => {
      if (err) {
        console.log(err);
      } else {
        console.log(`JSON saved to ${outputJsonFilename}`);
      }
    });
  })
  .catch(err => {
    console.log(err);
  });

if (graphqlSchemaSource.includes('http')) {
  const file = fs.createWriteStream(outputGraphQLFilename);
  http.get(graphqlSchemaSource, response => {
    response.pipe(file);

    file.on('finish', () => {
      file.close();
      console.log(`GraphQL schema saved to ${outputGraphQLFilename}`);
      copySchema(outputGraphQLFilename, outputGraphQLFileCopy);
    });
  });
} else {
  copySchema(graphqlSchemaSource, outputGraphQLFilename);
  copySchema(graphqlSchemaSource, outputGraphQLFileCopy);
}
