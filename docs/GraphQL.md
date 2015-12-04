- If the data schema available from the OTP backend changes
  (for example if new query types are added),
  you need to regenerate the schema by running
  `cd build; SERVER_ROOT=http://your-otp-host node generate-schema.js`
