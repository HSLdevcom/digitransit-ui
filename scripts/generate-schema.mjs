/* eslint-disable no-console */
import fs from 'fs';
import http from 'https';
import path from 'path';

const rootDir = import.meta.dirname;

const graphqlSchemaSource =
  process.env.SCHEMA_SRC ||
  'https://raw.githubusercontent.com/HSLdevcom/OpenTripPlanner/v2/application/src/main/resources/org/opentripplanner/apis/gtfs/schema.graphqls';
const outputGraphQLFilename = path.join(
  rootDir,
  '..',
  'schema',
  'schema.graphql',
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
    });
  });
} else {
  copySchema(graphqlSchemaSource, outputGraphQLFilename);
}
