import { hasCitybikes } from './modeUtils';
import {
  PREFIX_ITINERARY_SUMMARY,
  PREFIX_STOPS,
  PREFIX_ROUTES,
} from '../shared/path';

export const SEARCH_PATH_OPTS = {
  stopsPrefix: PREFIX_STOPS,
  routesPrefix: PREFIX_ROUTES,
  itinerarySummaryPrefix: PREFIX_ITINERARY_SUMMARY,
};

export function getLocationSearchTargets(config, isMobile) {
  let locationSearchTargets = ['Locations', 'CurrentPosition'];

  if (config.locationSearchTargetsFromOTP) {
    locationSearchTargets = [
      ...locationSearchTargets,
      ...config.locationSearchTargetsFromOTP,
    ];
  } else {
    locationSearchTargets.push('Stations');
    locationSearchTargets.push('Stops');
    if (hasCitybikes(config.vehicleRental?.networks, config)) {
      locationSearchTargets.push('VehicleRentalStations');
    }
    if (config.includeParkAndRideSuggestions) {
      locationSearchTargets.push('ParkingAreas');
    }
  }
  if (isMobile) {
    locationSearchTargets.push('MapPosition');
  }
  return locationSearchTargets;
}
