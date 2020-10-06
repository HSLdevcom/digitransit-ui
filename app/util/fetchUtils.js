const delay = ms =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

// Tries to fetch 1 + retryCount times until 200 is returned.
// Uses retryDelay (ms) between requests. url and options are normal fetch parameters
export const retryFetch = (URL, options = {}, retryCount, retryDelay) =>
  new Promise((resolve, reject) => {
    const retry = retriesLeft => {
      fetch(URL, options)
        .then(res => {
          if (res.ok) {
            resolve(res);
            // Don't retry if user is not logged in
          } else if (res.status === 401) {
            throw res.status;
          } else {
            // eslint-disable-next-line no-throw-literal
            throw `${URL}: ${res.statusText}`;
          }
        })
        .catch(async err => {
          if (retriesLeft > 0 && err !== 401) {
            await delay(retryDelay);
            retry(retriesLeft - 1);
          } else {
            reject(err);
          }
        });
    };
    retry(retryCount);
  });

export default retryFetch;
