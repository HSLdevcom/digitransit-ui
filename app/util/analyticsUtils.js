import Cookies from 'universal-cookie';
import { PREFIX_ITINERARY_SUMMARY, PREFIX_ROUTES } from './path';

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
 * Builds an inline CE2 survey script tag.
 *
 * @param {object} surveyIds - Map of language code → Crazy Egg survey UUID.
 *   Only languages explicitly listed will trigger a survey; no fallback is applied.
 *   e.g. `{ fi: 'uuid-fi', sv: 'uuid-sv', en: 'uuid-en' }`
 * @param {object} [options]
 * @param {string} [options.language] - Current user language (from the lang cookie). If the
 *   language is not a key in surveyIds, no script is generated.
 * @param {string} [options.pathPrefix] - Only show when pathname includes this value
 * @param {number} [options.surveyShare] - Modulo divisor for sampling (e.g. 250 → ~0.4% of visits)
 * @param {number} [options.delay] - Milliseconds to wait before showing the survey
 * @param {boolean} [options.mobileChecks] - Skip survey when mobile overlays are open
 * @return {string} - HTML script tag string, or '' if no survey ID matches the language
 */
export function buildCrazyEggSurveyScript(surveyIds, options = {}) {
  const { language, pathPrefix, surveyShare, delay, mobileChecks } = options;

  const surveyId = surveyIds[language];
  if (!surveyId) {
    return '';
  }

  const pathCheck = pathPrefix
    ? `window.location.pathname.includes("${pathPrefix}")`
    : null;
  const samplingCheck = surveyShare
    ? `(Math.floor(Date.now()/1000)%${surveyShare})===0`
    : null;
  const outerCondition = [pathCheck, samplingCheck].filter(Boolean).join('&&');

  const mobileGuard = mobileChecks
    ? `if(!document.getElementsByClassName('offcanvas-mobile')[0]&&!document.getElementById('digitransit-mobile-datetime')){CE2.showSurvey("${surveyId}")};`
    : `CE2.showSurvey("${surveyId}");`;

  let inner;
  if (delay) {
    inner = `setTimeout(()=>{${mobileGuard}},${delay});`;
  } else {
    inner = mobileGuard;
  }

  const body = outerCondition ? `if(${outerCondition}){${inner}}` : inner;

  return `<script type="text/javascript">(window.CE_API||(window.CE_API=[])).push(function(){${body}});</script>`;
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
      const surveyShare = 2; // TODO uncomment after testing: process.env.SURVEY_SHARE || 250;
      const surveyStartupDelay = 2000; // TODO uncomment after testing: 8000;
      const lang = cookies.get('lang');
      const ceBase =
        '<script type="text/javascript" src="//script.crazyegg.com/pages/scripts/0030/3436.js" async="async" ></script>';
      // Show survey conditions for certain share of page loads:
      // - only in itinerary page
      // - after 8 s delay
      // - not when mobile time picker or mobile settings are open
      const ceItineraryPage = buildCrazyEggSurveyScript(
        {
          fi: '470215ef-c02e-4123-a9de-2792c0fcaf97',
          sv: 'dd11434b-5a93-4daa-905e-3198ac502d1e',
          en: 'd2ffe981-45a8-43b9-aa1b-68e100aa1c12',
        },
        {
          language: lang,
          pathPrefix: PREFIX_ITINERARY_SUMMARY,
          surveyShare,
          delay: surveyStartupDelay,
          mobileChecks: true,
        },
      );
      // Show survey conditions for certain share of page loads:
      // - only in route page
      // - after 8 s delay
      // - not when mobile time picker or mobile settings are open
      const ceRoutePage = buildCrazyEggSurveyScript(
        { fi: '712691e8-45fb-47c3-8bbe-a293ce1e47fe' },
        {
          language: lang,
          pathPrefix: PREFIX_ROUTES,
          surveyShare,
          delay: surveyStartupDelay,
          mobileChecks: true,
        },
      );
      script = `${script}${ceBase}${ceItineraryPage}${ceRoutePage}`;
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
