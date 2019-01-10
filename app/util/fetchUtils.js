const delay = ms =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

export const retryFetch = (url, options = {}, retryCount, retryDelay) =>
  new Promise((resolve, reject) => {
    const retry = retriesLeft => {
      fetch(url, options)
        .then(res => {
          if (res.ok) {
            resolve(res);
          } else {
            // eslint-disable-next-line no-throw-literal
            throw `${url}: ${res.statusText}`;
          }
        })
        .catch(async err => {
          if (retriesLeft > 0) {
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
