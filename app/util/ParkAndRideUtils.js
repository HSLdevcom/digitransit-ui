/* eslint-disable no-unused-vars */
const ParkAndRideUtils = {
  HSL: {
    getAuthenticationMethods: park => {
      const { tags } = park;
      if (Array.isArray(tags)) {
        return tags
          .filter(tag => tag.includes('AUTHENTICATION_METHOD'))
          .map(tag => tag.replace('AUTHENTICATION_METHOD_', '').toLowerCase());
      }
      return [];
    },
    getPricingMethods: park => {
      const { tags } = park;
      if (Array.isArray(tags)) {
        return tags
          .filter(tag => tag.includes('PRICING_METHOD'))
          .map(tag => tag.replace('PRICING_METHOD_', '').toLowerCase());
      }
      return [];
    },
    getServices: park => {
      const { tags } = park;
      if (Array.isArray(tags)) {
        return tags
          .filter(tag => tag.includes('SERVICE'))
          .map(tag => tag.replace('SERVICE_', '').toLowerCase());
      }
      return [];
    },
    getOpeningHours: park => {
      const { openingHours } = park;
      if (Array.isArray(openingHours)) {
        const openingHoursByDay = openingHours.map(openingHour => {
          const dateString = openingHour.date;
          const year = dateString.substring(0, 4);
          const month = dateString.substring(4, 6);
          const day = dateString.substring(6, 8);
          return {
            day: new Date(year, month - 1, day).getDay(),
            timeSpans: openingHour.timeSpans[0],
          };
        });
        return openingHoursByDay;
      }
      return [];
    },
    isFree: pricingMethods => {
      return pricingMethods.some(method => method.includes('free'));
    },
    isPaid: pricingMethods => {
      return pricingMethods.some(method => method.includes('paid'));
    },
  },
  default: {
    getAuthenticationMethods: park => {
      return [];
    },
    getPricingMethods: park => {
      return [];
    },
    getServices: park => {
      return [];
    },
    getOpeningHours: park => {
      return [];
    },
  },
};

export default ParkAndRideUtils;
