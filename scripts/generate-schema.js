/* eslint-disable import/no-extraneous-dependencies, no-console */
const fs = require('fs');
const http = require('https');
const path = require('path');

const graphqlSchemaSource =
  process.env.SCHEMA_SRC ||
  'https://raw.githubusercontent.com/HSLdevcom/OpenTripPlanner/v2/application/src/main/resources/org/opentripplanner/apis/gtfs/schema.graphqls';
const outputGraphQLFilename = path.join(
  __dirname,
  '..',
  'schema',
  'schema.graphql',
);
const outputGraphQLFileCopy = path.join(
  __dirname,
  '..',
  'digitransit-search-util/packages/digitransit-search-util-query-utils/schema/schema.graphql',
);

const copySchema = (src, dest) => {
  fs.copyFile(src, dest, err => {
    if (err) {
      throw err;
    }
    console.log(`${src} was copied to ${dest}`);
  });
};

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
