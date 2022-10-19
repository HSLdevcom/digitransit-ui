/* eslint-disable import/no-extraneous-dependencies, no-console */
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { getIntrospectionQuery } = require('graphql');

const introspectionQuery = getIntrospectionQuery();
const outputPath = path.join(__dirname, 'schema.json');

const authHeaders = process.env.ROUTING_API_SUBSCRIPTION_KEY
  ? {
      'digitransit-subscription-key': process.env.ROUTING_API_SUBSCRIPTION_KEY,
    }
  : {};

const apiUrl = process.env.API_URL || 'https://dev-api.digitransit.fi';
const otpUrl = process.env.OTP_URL || `${apiUrl}/routing/v2/routers/hsl/`;
const url = `${otpUrl}index/graphql`;
console.info('fetching schema from', url);

fetch(url, {
  method: 'post',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...authHeaders,
  },
  body: JSON.stringify({
    query: introspectionQuery,
  }),
})
  .then(response => {
    if (!response.ok) {
      const error = new Error(
        `failed to generate schema: ${response.status} ${response.statusText}`,
      );
      error.url = url;
      error.response = response;
      error.headers = new Map(response.headers.entries());
      throw error;
    }
    console.log(response.headers);
    return response.json();
  })
  .then(json => {
    return new Promise((resolve, reject) => {
      fs.writeFile(outputPath, JSON.stringify(json, null, 4), err => {
        if (err) {
          reject(err);
        } else {
          console.info(`schema saved to ${outputPath}`);
          resolve();
        }
      });
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
