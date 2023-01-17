/* eslint-disable no-unused-vars */
const ParkAndRideUtils = {
  HSL: {
    getAuthenticationMethods: park => {
      const { tags } = park;
      if (Array.isArray(tags)) {
        const allowedAuthenticationMethods = [
          'liipi:AUTHENTICATION_METHOD_HSL_TICKET',
          'liipi:AUTHENTICATION_METHOD_VR_TICKET',
          'liipi:AUTHENTICATION_METHOD_HSL_TRAVEL_CARD',
        ];
        return tags
          .filter(tag => allowedAuthenticationMethods.includes(tag))
          .map(tag =>
            tag.replace('liipi:AUTHENTICATION_METHOD_', '').toLowerCase(),
          );
      }
      return [];
    },
    getPricingMethods: park => {
      const { tags } = park;
      if (Array.isArray(tags)) {
        return tags
          .filter(tag => tag.includes('liipi:PRICING_METHOD'))
          .map(tag => tag.replace('liipi:PRICING_METHOD_', '').toLowerCase());
      }
      return [];
    },
    getServices: park => {
      const { tags } = park;
      if (Array.isArray(tags)) {
        const allowedServices = [
          'liipi:SERVICE_LIGHTING',
          'liipi:SERVICE_COVERED',
          'liipi:SERVICE_SURVEILLANCE_CAMERAS',
          'liipi:SERVICE_PAYMENT_AT_GATE',
          'liipi:SERVICE_ENGINE_IGNITION_AID',
          'liipi:SERVICE_BICYCLE_FRAME_LOCK',
        ];
        return tags
          .filter(tag => allowedServices.includes(tag))
          .map(tag => tag.replace('liipi:SERVICE_', '').toLowerCase());
      }
      return [];
    },
    getOpeningHours: park => {
      const { openingHours } = park;
      if (Array.isArray(openingHours?.dates)) {
        const openingHoursByDay = openingHours.dates.map(openingHour => {
          const dateString = openingHour.date;
          const year = dateString.substring(0, 4);
          const month = dateString.substring(4, 6);
          const day = dateString.substring(6, 8);
          return {
            date: new Date(year, month - 1, day),
            timeSpans: openingHour?.timeSpans && openingHour?.timeSpans[0],
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
