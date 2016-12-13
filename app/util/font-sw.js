const CACHE = 'font-cache-v1';
const FONT_DOMAIN = 'https://cloud.typography.com/';

function fetchAndCache(request, cache) {
  return fetch(request.clone()).then((response) => {
    if (response.status < 400) {
      cache.put(request, response.clone());
    }

    return response;
  });
}

self.addEventListener('fetch', (event) => {
  // Do not cache other than font assets that need click counting on every request.
  if (!event.request.url.startsWith(FONT_DOMAIN)) { return; }

  event.respondWith(
    caches.open(CACHE).then(cache => cache.match(event.request).then((cacheResponse) => {
      if (cacheResponse) {
        // Required to fetch the fonts for every page load, we also use this to refresh the cache.
        fetchAndCache(event.request, cache);
        return cacheResponse;
      }
      return fetchAndCache(event.request, cache);
    }).catch((error) => { throw error; }),
  ));
});
