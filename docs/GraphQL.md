- If the data schema available from the OTP backend changes
  (for example if new query types are added),
  you need to regenerate the schema by running
  `node build/generate-schema.js`

  When running OTP locally, pass a custom `$OTP_URL`:
  `OTP_URL='http://localhost:8080/otp/routers/default/' node build/generate-schema.js`

  Note that [some of the public `digitransit.fi` APIs require authentication](https://digitransit.fi/en/developers/api-registration/); Pass it as `$ROUTING_API_SUBSCRIPTION_KEY`:
  ```sh
  ROUTING_API_SUBSCRIPTION_KEY=… node build/generate-schema.js
  ```
