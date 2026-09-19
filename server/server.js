/* eslint-disable no-console */
import { getConfiguration } from './configs/config.js';
import createApp from './app.js';
import fetchTicketPrices from './services/ticketPrices.js';
import collectGeoJsonZones from './services/geoJsonZones.js';
import fetchCitybikeConfigurations from './services/citybikeSeasons.js';

const state = {
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
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function main() {
  const config = getConfiguration();
  const { app, redisClient } = createApp();
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
}

await main();
