/* eslint-disable no-console */
// Local CDN tester: run `node server/proxyTester.js`, then start the app with
//   ASSET_URL="http://localhost:9000/proxy" yarn run start
// Requests to http://localhost:9000/proxy/* are forwarded to the running app.
const http = require('node:http');

const PORT = 9000;
const TARGET = 'http://localhost:8080';

http
  .createServer(async (req, res) => {
    try {
      const url = TARGET + req.url.replace(/^\/proxy/, '');
      const headers = { ...req.headers };
      delete headers.host;
      const upstream = await fetch(url, { headers, redirect: 'manual' });
      const body = Buffer.from(await upstream.arrayBuffer());
      const out = Object.fromEntries(upstream.headers);
      // fetch already decoded the body
      delete out['content-encoding'];
      delete out['content-length'];
      res.writeHead(upstream.status, out);
      res.end(body);
    } catch (err) {
      res.writeHead(502).end(String(err));
    }
  })
  .listen(PORT, () =>
    console.log('proxyTester on http://localhost:%d/proxy', PORT),
  );
