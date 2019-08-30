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
    timetableUrlResolver: function timetableUrlResolver(baseURL, route) {
      const routeIdSplitted = route.gtfsId.split(':');
      const routeId = routeIdSplitted[1];
      const routePDFUrlName = this.availableRouteTimetables[routeId];
      if (routePDFUrlName === undefined) {
        return null;
      }

      return baseURL + routePDFUrlName + '.pdf';
    },
    setAvailableRouteTimetables: function setAvailableRouteTimetables(
      timetables,
    ) {
      this.availableRouteTimetables = timetables;
    },
    stopPdfUrlResolver: function stopPdfUrlResolver(baseURL, stop) {
      const stopIdSplitted = stop.gtfsId.split(':');
      return baseURL + stopIdSplitted[1] + '.pdf';
    },
  },
  tampere: {
    timetableUrlResolver: function timetableUrlResolver(baseURL, route) {
      const routeIdSplitted = route.gtfsId.split(':');
      const routeId = routeIdSplitted[1].replace(/[^\d]/g, '');
      return baseURL + 'linja' + routeId + '.pdf';
    },
    stopPdfUrlResolver: function stopPdfUrlResolver(baseURL, stop) {
      const stopIdSplitted = stop.gtfsId.split(':');
      return baseURL + parseInt(stopIdSplitted[1], 10) + '.pdf';
    },
  },
};
