// The app used to register a Workbox service worker at /sw.js (earlier an
// offline-plugin one). It has been removed, but browsers that installed it
// keep it until /sw.js serves something new - a 404 leaves the old worker
// in place. This replacement clears every cache the old worker created and
// unregisters itself. It has no fetch handler, so open pages go straight
// to the network, and it doesn't reload them: the next navigation is
// simply uncontrolled.
//
// Can be deleted once old registrations have aged out (added 2026-09).
export const SERVICE_WORKER_REMOVAL_SCRIPT = `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.registration.unregister()),
  );
});
`;
