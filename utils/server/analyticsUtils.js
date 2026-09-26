import Cookies from 'universal-cookie';
import { PREFIX_ITINERARY_SUMMARY, PREFIX_ROUTES } from '../shared/path.js';

/**
 * Server-side UI analytics helpers: build the analytics <script> tags that are
 * inlined into the HTML shell.
 */

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
      const surveyShare = config.SURVEY_SHARE || 250;
      const surveyStartupDelay = 8000;
      const lang = cookies.get('lang');
      const ceBase =
        '<script type="text/javascript" src="//script.crazyegg.com/pages/scripts/0030/3436.js" async="async" ></script>';
      // Show survey conditions for certain share of page loads:
      // - only in itinerary page
      // - after 8 s delay
      // - not when mobile time picker or mobile settings are open
      const ceItineraryPage = buildCrazyEggSurveyScript(
        {
          fi: '8cb293bb-6785-481a-81c3-7f4e6f04a536',
          sv: '904fe02f-fde8-41b7-933b-ea215cdd5a00',
          en: '254eb853-fa71-4b3c-8313-9eeca10129b6',
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
        { fi: '96b0b2f3-bc5a-4b40-b910-cc65bb5b6cd9' },
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
