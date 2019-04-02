/* eslint-disable prefer-template */
export default {
  HSLRoutes: {
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
  },
};
