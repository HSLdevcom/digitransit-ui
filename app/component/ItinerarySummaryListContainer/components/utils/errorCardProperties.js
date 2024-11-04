import {
  ICON_CAUTION,
  ICON_INFO,
  ICON_TYPE_INFO,
  ICON_TYPE_CAUTION,
} from '../constants';
import NationalServiceLink from '../components/NationalServiceLink';
import PastLink from '../components/PastLink';
import ChangeDepartureTimeLink from '../components/ChangeDepartureTimeLink';

const info = { iconType: ICON_TYPE_INFO, iconImg: ICON_INFO };
const caution = { iconImg: ICON_CAUTION, iconType: ICON_TYPE_CAUTION };

/**
 * Priority-ordered list of properties to describe error card rendering.
 * If many error messages match the user's query, first in the 'errorCardProps'
 * should be shown to user.
 */
const errorCardProps = [
  {
    id: 'no-route-already-at-destination',
    props: {
      bodyId: 'no-route-already-at-destination',
      LinkComponent: null,
      ...info,
    },
  },
  {
    id: 'no-route-origin-same-as-destination',
    props: {
      bodyId: 'no-route-origin-same-as-destination',
      ...info,
    },
  },
  {
    id: 'itinerary-in-the-past',
    props: {
      ...info,
      titleId: 'itinerary-in-the-past-title',
      bodyId: 'itinerary-in-the-past',
      LinkComponent: PastLink,
    },
  },
  {
    id: 'outside-bounds-1',
    props: {
      titleId: 'router-unable',
      bodyId: 'destination-outside-service',
      LinkComponent: NationalServiceLink,
      ...info,
    },
  },
  {
    id: 'outside-bounds-2',
    props: {
      titleId: 'router-unable',
      bodyId: 'origin-outside-service',
      LinkComponent: NationalServiceLink,
      ...info,
    },
  },
  {
    id: 'outside-bounds-3',
    props: {
      titleId: 'router-unable',
      bodyId: 'router-outside-bounds-3',
      LinkComponent: NationalServiceLink,
      ...info,
    },
  },
  {
    id: 'outside-service-period',
    props: {
      titleId: 'router-unable',
      bodyId: 'router-outside-service-period',
      LinkComponent: PastLink,
      ...info,
    },
  },
  {
    id: 'no-transit-connection',
    props: {
      titleId: 'no-route-msg',
      bodyId: 'router-transit-connection',
      ...info,
    },
  },
  {
    id: 'location-not-found-1',
    props: {
      titleId: 'router-location-not-found-title-1',
      bodyId: 'router-location-not-found',
      ...info,
    },
  },
  {
    id: 'location-not-found-2',
    props: {
      titleId: 'router-location-not-found-title-2',
      bodyId: 'router-location-not-found',
      ...info,
    },
  },
  {
    id: 'location-not-found-3',
    props: {
      titleId: 'router-location-not-found-title-3',
      bodyId: 'router-location-not-found',
      ...info,
    },
  },
  {
    id: 'no-stops-in-range-1',
    props: {
      titleId: 'router-unable',
      bodyId: 'router-stops-in-range-1',
      ...info,
    },
  },
  {
    id: 'no-stops-in-range-2',
    props: {
      titleId: 'router-unable',
      bodyId: 'router-stops-in-range-2',
      ...info,
    },
  },
  {
    id: 'no-stops-in-range-3',
    props: {
      titleId: 'router-unable',
      bodyId: 'router-stops-in-range-3',
      ...info,
    },
  },
  {
    id: 'walk-bike-itinerary-4',
    props: {
      bodyId: 'walk-bike-itinerary-4',
      ...info,
    },
  },
  {
    id: 'walk-bike-itinerary-1',
    props: {
      bodyId: 'walk-bike-itinerary-1',
      ...info,
    },
  },
  {
    id: 'walk-bike-itinerary-2',
    props: {
      bodyId: 'walk-bike-itinerary-2',
      ...info,
    },
  },
  {
    id: 'walk-bike-itinerary-3',
    props: {
      bodyId: 'walk-bike-itinerary-3',
      ...info,
    },
  },
  {
    id: 'walking-better-than-transit',
    props: {
      titleId: 'router-only-walk-title',
      bodyId: 'router-only-walk',
      ...info,
    },
  },
  {
    id: 'no-transit-connection-in-search-window',
    props: {
      titleId: 'no-route-msg',
      bodyId: 'router-transit-connection-in-search-window',
      LinkComponent: ChangeDepartureTimeLink,
      ...info,
    },
  },
  {
    id: 'no-route-msg-with-changes',
    props: {
      bodyId: 'no-route-msg-with-changes',
      ...caution,
    },
  },
  {
    id: 'system-error',
    props: {
      titleId: 'router-unable',
      bodyId: 'router-system-error',
      ...caution,
    },
  },
  {
    id: 'no-route-msg',
    props: {
      bodyId: 'no-route-msg',
      ...caution,
    },
  },
];

export default errorCardProps;
