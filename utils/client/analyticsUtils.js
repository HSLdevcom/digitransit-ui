import Cookies from 'universal-cookie';

/**
 * Client-side UI analytics helpers. The server-side analytics <script>
 * builders live in utils/server/analyticsUtils.js.
 */

/**
 * Add an analytics event to be sent to analytics server
 * Currently events have fields { event, category, action, name }
 *
 * @param {object} event
 *
 * @return void
 */
export function addAnalyticsEvent(event) {
  if (window.dataLayer) {
    let newEvent = event;
    if (event.event === undefined) {
      // this is the default event field if none is defined
      newEvent = { event: 'sendMatomoEvent', ...event };
    }
    window.dataLayer.push(newEvent);
  }
}

const handleChange = () => {
  if (!window.CookieInformation) {
    return false;
  }
  const allow = window.CookieInformation.getConsentGivenFor(
    'cookie_cat_statistic',
  );
  if (allow === undefined) {
    // happens in incognito
    return false;
  }
  const cookies = new Cookies();
  const cookieConsent = cookies.get('cookieConsent');
  const oldState = cookieConsent === true || cookieConsent === 'true';

  cookies.set('cookieConsent', allow, {
    maxAge: 100 * 365 * 24 * 60 * 60,
    path: '/',
    Secure: true,
    SameSite: 'Strict',
  });

  if (oldState !== allow) {
    // consent changed, reload page
    window.location.reload();
  }
  return allow;
};

/**
 * Client side intialization for UI analytics
 *
 * @return void
 */
export function initAnalyticsClientSide(config, cookies = new Cookies()) {
  const useAnalytics =
    !config.useCookiesPrompt || cookies.get('cookieConsent') === true;

  if (useAnalytics) {
    window.dataLayer = window.dataLayer || [];
  }
  if (config.useCookiesPrompt) {
    window.addEventListener(
      'CookieInformationConsentGiven',
      handleChange,
      false,
    );
  }
}

/**
 * Handle user analytics
 * @param {object} user - user object
 * @param {object} config - configuration object
 */
export function handleUserAnalytics(config) {
  if (config.loginAnalyticsEventName && config.user.sub) {
    addAnalyticsEvent({
      event: config.loginAnalyticsEventName,
      [config.loginAnalyticsKey]: config.user.sub,
    });
  }
}
