/* eslint-disable no-unused-vars */
export default {
  liipi: {
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
        const result = tags
          .filter(tag => allowedServices.includes(tag))
          .map(tag => tag.replace('liipi:SERVICE_', '').toLowerCase());
        if (park.wheelchairAccessibleCarPlaces) {
          result.push('accessible-car-places');
        }
        return result;
      }
      return [];
    },
    getOpeningHours: park => {
      const { openingHours } = park;
      const osm = openingHours?.osm;
      if (osm) {
        if (osm === 'Mo-Fr 0:00-23:59; Sa 0:00-23:59; Su 0:00-23:59') {
          return ['24 h'];
        }
        if (osm === '') {
          return [];
        }
        return osm.split(';').map(val => val.toLowerCase().trim());
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
