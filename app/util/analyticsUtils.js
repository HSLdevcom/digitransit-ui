import Cookies from 'universal-cookie';

/**
 * This file contains functions for UI analytics.
 * Contains code used in both client and server
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

/**
 * Get code to initialize UI analytics in server side
 *
 * @param {number|string} GTMid Google Tag Manager id
 *
 * @return string
 */
export function getAnalyticsInitCode(config, req) {
  const { hostname } = req;
  const cookies = new Cookies(req.headers.cookie, { path: '/' });
  const cookieConsent = cookies.get('cookieConsent');

  let script = config.GTMid
    ? // Google Tag Manager script
      `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${config.GTMid}');</script>\n`
    : '';

  const useAnalytics =
    !config.useCookiesPrompt ||
    cookieConsent === 'true' ||
    cookieConsent === true;

  if (useAnalytics) {
    if (
      config.analyticsScript &&
      hostname &&
      (!hostname.match(/dev|test/) || config.devAnalytics)
    ) {
      return config.analyticsScript(
        hostname,
        config.sendAnalyticsCustomEventGoals,
      );
    }
    if (config.crazyEgg) {
      const lang = cookies.get('lang');
      let id;
      switch (lang) {
        case 'sv':
          id = 'dd11434b-5a93-4daa-905e-3198ac502d1e';
          break;
        case 'en':
          id = 'd2ffe981-45a8-43b9-aa1b-68e100aa1c12';
          break;
        default:
          id = '470215ef-c02e-4123-a9de-2792c0fcaf97';
          break;
      }
      const ce1 =
        '<script type="text/javascript" src="//script.crazyegg.com/pages/scripts/0030/3436.js" async="async" ></script>';
      const ce2 = `<script type="text/javascript">(window.CE_API || (window.CE_API=[])).push(function(){CE2.showSurvey("${id}");});</script>`;
      script = `${script}${ce1}${ce2}`;
    }
  }
  return script;
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
export function handleUserAnalytics(user, config) {
  if (config.loginAnalyticsEventName && user?.sub) {
    addAnalyticsEvent({
      event: config.loginAnalyticsEventName,
      [config.loginAnalyticsKey]: user.sub,
    });
  }
}
