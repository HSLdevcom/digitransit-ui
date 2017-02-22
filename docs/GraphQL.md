- If the data schema available from the OTP backend changes
  (for example if new query types are added),
  you need to regenerate the schema by running
  `cd build; SERVER_ROOT=http://your-otp-host node generate-schema.js`

  When running otp in localhost, this usually translates to:
  `cd build; SERVER_ROOT=http://localhost:8080/otp node generate-schema.js`
