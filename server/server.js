import { getConfiguration } from './configs/config.js';
import createApp from './app.js';
import { createManifestMiddleware } from './middleware/manifestMiddleware.js';
import fetchTicketPrices from './services/ticketPrices.js';
import collectGeoJsonZones from './services/geoJsonZones.js';
import fetchCitybikeConfigurations from './services/citybikeSeasons.js';

const state = {
  devMiddleware:
    process.env.NODE_ENV === 'development'
      ? (await import('./middleware/devMiddleware.js')).default()
      : undefined,
  httpServer: undefined,
  redisClient: undefined,
};

// Stop accepting new connections and let in-flight requests finish (up to a
// grace period, kept under `docker stop`'s default 10s so our own clean
// exit(1) below wins the race instead of being cut off by a SIGKILL) before
// closing the Redis connection (if OIDC/sessions are configured) and
// exiting. Running as PID 1 in a container means the kernel skips the
// default terminate-on-signal action entirely unless a handler is
// registered (SIGTERM/SIGINT would otherwise just be silently discarded).
function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully`);

  const forceExitTimer = setTimeout(() => {
    console.log('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 8_000);
  forceExitTimer.unref();

  const closeRedisAndExit = () =>
    state.redisClient
      ? state.redisClient.quit(() => process.exit(0))
      : process.exit(0);

  const closeHttpServer = () => {
    if (state.httpServer) {
      state.httpServer.close(closeRedisAndExit);
      // `close()` above only stops accepting new connections - it waits
      // indefinitely for already-open keep-alive sockets to close on their
      // own. Proactively close idle ones now so only genuinely in-flight
      // requests hold up the shutdown.
      state.httpServer.closeIdleConnections();
    } else {
      closeRedisAndExit();
    }
  };

  // Development: first end the hot-update streams (open requests the HTTP
  // server would wait for), stop watching and write webpack's cache, e.g.
  // before a `node --watch` restart.
  if (state.devMiddleware) {
    state.devMiddleware.close(closeHttpServer);
  } else {
    closeHttpServer();
  }
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const config = getConfiguration();
const { app, redisClient } = createApp(
  // Puts the client bundle's files on res.locals.assets: from the current build
  // in development, from manifest.json in production.
  state.devMiddleware ?? createManifestMiddleware(),
);
state.redisClient = redisClient;

await Promise.all([
  fetchTicketPrices(config),
  collectGeoJsonZones(),
  fetchCitybikeConfigurations(),
]);

state.httpServer = app.listen(config.PORT, () =>
  console.log(
    'Digitransit-ui available on port %d',
    state.httpServer.address().port,
  ),
);
