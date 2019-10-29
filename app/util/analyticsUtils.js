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
  let newEvent = event;
  if (event.event === undefined) {
    // this is the default event field if none is defined
    newEvent = { event: 'sendMatomoEvent', ...event };
  }
  window.dataLayer.push(newEvent);
}

/**
 * Get code to initialize UI analytics in server side
 *
 * @param {number|string} GTMid Google Tag Manager id
 *
 * @return string
 */
export function getAnalyticsInitCode(GTMid) {
  if (!GTMid) {
    return '';
  }
  // Google Tag Manager script
  return `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTMid}');</script>\n`;
}

/**
 * Client side intialization for UI analytics
 *
 * @return void
 */
export function initAnalyticsClientSide() {
  window.dataLayer = window.dataLayer || [];
}
