import { COMMIT_ID, BUILD_TIME } from '../buildInfo';

/* eslint-disable no-underscore-dangle */
window._paq = window._paq || [];

function loadPiwik(config) {
  const g = document.createElement('script');
  g.type = 'text/javascript';
  g.async = true;
  g.defer = true;
  g.src = config.PIWIK_ADDRESS.replace('.php', '.js');
  document.getElementsByTagName('body')[0].appendChild(g);
}

export default function createPiwik(config, raven) {
  let visitorId;

  window._paq.push(['enableLinkTracking']);
  window._paq.push(['setTrackerUrl', config.PIWIK_ADDRESS]);
  window._paq.push(['setSiteId', config.PIWIK_ID]);
  window._paq.push(['setCustomVariable', 4, 'commit_id', COMMIT_ID, 'visit']);
  window._paq.push(['setCustomVariable', 5, 'build_time', BUILD_TIME, 'visit']);
  window._paq.push([
    function configureVisitorId() {
      visitorId = this.getVisitorId();
      if (raven) {
        raven.setUserContext({ piwik: visitorId });
      }
    },
  ]);

  const piwik = {};
  // ['setCustomUrl', 'setCustomVariable', 'trackEvent', 'trackPageView'].forEach(
  ['setCustomUrl', 'setCustomVariable', 'trackPageView'].forEach(i => {
    piwik[i] = (...args) => window._paq.push([i, ...args]);
  });

  // Disabled event tracking temporarely
  piwik.trackEvent = () => null;

  /* eslint-enable no-underscore-dangle */

  piwik.getVisitorId = () => visitorId;

  if (config.PIWIK_ADDRESS && config.PIWIK_ID != null) {
    const callback = () => loadPiwik(config);
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback);
    } else {
      window.setTimeout(callback, 1000);
    }
  }

  return piwik;
}
