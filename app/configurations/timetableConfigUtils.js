/* eslint-disable no-unused-vars */
/* eslint-disable prefer-template */

export default {
  HSL: {
    routeTimetableUrlResolver: function routeTimetableUrlResolver(
      baseURL,
      route,
      date,
      lang,
    ) {
      const routeId = route.gtfsId.split(':')[1];

      // From YYYYMMDD to YYYY-MM-DD
      const formattedDate = date.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');

      const defaultSearchParams =
        'props[showPrintButton]=true&props[redirect]=false';
      const url = new URL(`${baseURL}&${defaultSearchParams}`);
      url.searchParams.append('props[lineId]', routeId);
      url.searchParams.append('props[dateBegin]', formattedDate);
      url.searchParams.append('props[dateEnd]', formattedDate);
      url.searchParams.append('props[lang]', lang);
      return url;
    },
    stopTimetableUrlResolver: function stopTimetableUrlResolver(
      baseURL,
      stop,
      date,
      lang,
    ) {
      const stopId = stop.gtfsId.split(':')[1];
      const formattedDate = date.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
      const defaultSearchParams =
        'props[isSummerTimetable]=false&props[printTimetablesAsA4]=true&props[printTimetablesAsGreyscale]=false&props[template]=default&props[showAddressInfo]=false&props[showPrintButton]=true&props[redirect]=false&template=default';
      const url = new URL(`${baseURL}&${defaultSearchParams}`);
      url.searchParams.append('props[stopId]', stopId);
      url.searchParams.append('props[date]', formattedDate);
      url.searchParams.append('props[lang]', lang);
      return url;
    },
  },
  tampere: {
    routeTimetableUrlResolver: function routeTimetableUrlResolver(
      baseURL,
      route,
      date,
      lang,
    ) {
      const routeNumber = route.shortName.replace(/\D/g, '');
      return new URL(`${baseURL}${routeNumber}.html`);
    },
    stopTimetableUrlResolver: function stopTimetableUrlResolver(
      baseURL,
      stop,
      date,
      lang,
    ) {
      const stopIdSplitted = stop.gtfsId.split(':');
      return new URL(`${baseURL}${parseInt(stopIdSplitted[1], 10)}.pdf`);
    },
  },
};
