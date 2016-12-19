/* eslint-disable no-console, strict, import/no-extraneous-dependencies */

'use strict';

// This little dev server is basically a wrapped express server that
// 'hot loads' our javascript for super fast live reload in development
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../webpack.config');

const port = process.env.HOT_LOAD_PORT || 9000;

new WebpackDevServer(webpack(config), {
  proxy: { '*': `http://localhost:${port}` },
  publicPath: config.output.publicPath,
  noInfo: true,
  hot: true,
}).listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }

  console.log(`Hot load server listening at localhost:${port}`);
});
