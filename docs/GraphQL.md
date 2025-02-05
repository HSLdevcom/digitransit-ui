- If the data schema available from the OTP backend changes
  (for example if new query types are added),
  you need to regenerate the schema (schema.graphql) by running
  `cd build; node generate-schema.js`

  If you need to fetch the schema from some non-default location, `SCHEMA_SRC` changes
  the URL or filepath for the schema file in graphls format:

  `cd build; SCHEMA_SRC=where-schema-file-is-located node generate-schema.js`

  When copying from a local OTP clone, usually something like this works:

  `cd build; SCHEMA_SRC=~/OpenTripPlanner/application/src/main/resources/org/opentripplanner/apis/gtfs/schema.graphqls node generate-schema.js`
