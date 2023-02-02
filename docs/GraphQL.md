- If the data schema available from the OTP backend changes
  (for example if new query types are added),
  you need to regenerate the schema (schema.json and schema.graphql) by running
  `cd build; node generate-schema.js`

  If you need to fetch the schema from some non-default location, `SCHEMA_SRC` changes
  the URL or filepath for the schema file in graphls format and `SERVER_ROOT` fetches json format
  schema from a running OTP instance:

  `cd build; SCHEMA_SRC=where-schema-file-is-located SERVER_ROOT=http://your-otp-host node generate-schema.js`

  When running otp in localhost, this usually translates to something like:

  `cd build; SCHEMA_SRC=~/OpenTripPlanner/src/ext/resources/legacygraphqlapi/schema.graphqls SERVER_ROOT=http://localhost:8080/otp node generate-schema.js`
