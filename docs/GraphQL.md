- If the data schema available from the OTP backend changes
  (for example if new query types are added),
  you need to regenerate the schema (schema.json and schema.graphql) by running
  `cd build; node generate-schema.js`

  If you need to fetch the schema from some non-default location, `SCHEMA_SRC` changes
  the URL or filepath for the schema file in graphls format and `OTP_URL` fetches json format
  schema from a running OTP instance:

  `cd build; SCHEMA_SRC=where-schema-file-is-located OTP_URL=http://your-otp-host/routers/hsl/index/graphql node generate-schema.js`

  When running otp in localhost, this usually translates to something like:

  `cd build; SCHEMA_SRC=~/OpenTripPlanner/src/main/resources/org/opentripplanner/apis/gtfs/schema.graphqls OTP_URL=http://localhost:8080/otp/routers/hsl/index/graphql node generate-schema.js`
