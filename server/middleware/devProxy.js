import proxy from 'express-http-proxy';

// Passes /proxy/* through to the webpack-dev-server-driven dev bundle
// server, in development only. Isolated in its own module because this is
// the one piece of server/ coupled to webpack-dev-server specifically -
// swapping in a different dev server (e.g. Vite's) later only means
// rewriting this file, not the rest of server/.
export default function mountDevProxy(app) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  const hotloadPort = process.env.HOT_LOAD_PORT || 9000;
  app.use('/proxy/', proxy(`http://[::1]:${hotloadPort}/`));
}
