/* eslint-disable no-unused-vars */
/* eslint-disable prefer-template */

export default {
  HSL: {
    // Gets updated when server starts with {routeName: timetableName}
    // where routeName and timetableNames are route gtfsId values without "<feedname>:"
    availableRouteTimetables: {},

    // gets the name of the route (in gtfsId format without the "<feedname>:" part) which
    // contains the timetable pdf for the current route (it can be stored under different route)
    // if there is no available timetable for the route, return null so that the weekly
    // timetable button will not be rendered in UI
    timetableUrlResolver: function timetableUrlResolver(
      baseURL,
      route,
      subscriptionParam,
      subscriptionToken,
    ) {
      const routeIdSplitted = route.gtfsId.split(':');
      const routeId = routeIdSplitted[1];
      const routePDFUrlName = this.availableRouteTimetables[routeId];
      if (routePDFUrlName === undefined) {
        return null;
      }

      const url = new URL(`${baseURL}${routePDFUrlName}.pdf`);
      if (subscriptionParam && subscriptionToken) {
        url.searchParams.set(subscriptionParam, subscriptionToken);
      }
      return url;
    },
    setAvailableRouteTimetables: function setAvailableRouteTimetables(
      timetables,
    ) {
      this.availableRouteTimetables = timetables;
    },
    stopPdfUrlResolver: function stopPdfUrlResolver(
      baseURL,
      stop,
      subscriptionParam,
      subscriptionToken,
    ) {
      const stopIdSplitted = stop.gtfsId.split(':');
      const url = new URL(`${baseURL}${stopIdSplitted[1]}.pdf`);
      if (subscriptionParam && subscriptionToken) {
        url.searchParams.set(subscriptionParam, subscriptionToken);
      }
      return url;
    },
  },
  tampere: {
    timetableUrlResolver: function timetableUrlResolver(
      baseURL,
      route,
      subscriptionParam,
      subscriptionToken,
    ) {
      const routeNumber = route.shortName.replace(/\D/g, '');
      return new URL(`${baseURL}${routeNumber}.html`);
    },
    stopPdfUrlResolver: function stopPdfUrlResolver(
      baseURL,
      stop,
      subscriptionParam,
      subscriptionToken,
    ) {
      const stopIdSplitted = stop.gtfsId.split(':');
      return new URL(`${baseURL}${parseInt(stopIdSplitted[1], 10)}.pdf`);
    },
  },
};
