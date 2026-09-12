/* eslint-disable no-console */
import express from 'express';
import proxy from 'express-http-proxy';

const app = express();

const port = 9000;

app.use('/proxy', proxy('http://localhost:8080/'));

const server = app.listen(port, () =>
  console.log('Digitransit-ui available on port %d', server.address().port),
);

/*
  This file enables toy to test CDN functionality locally by starting with
  node server/proxyTester.mjs && \
  ASSET_URL="http://localhost:9000/proxy" yarn run start
*/
