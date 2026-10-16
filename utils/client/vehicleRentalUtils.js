import without from 'lodash/without';
import { getCustomizedSettings } from './localStorage';
import { addAnalyticsEvent } from '../shared/analyticsUtils';

/**
 * Retrieves all chosen citybike networks from the
 * localstorage
 *
 * @param {*} config The configuration for the software installation
 */

export const getCitybikeNetworks = () => {
  const { allowedBikeRentalNetworks } = getCustomizedSettings();
  return allowedBikeRentalNetworks || [];
};

export const getScooterNetworks = () => {
  const { scooterNetworks } = getCustomizedSettings();
  return scooterNetworks || [];
};

const addAnalytics = (action, name) => {
  addAnalyticsEvent({
    category: 'ItinerarySettings',
    action,
    name,
  });
};

/** *
 * Updates the list of allowed networks either by removing or adding.
 * Note: legacy settings had network names always in uppercase letters.
 *
 * @param networks the previously selected networks
 * @param networkName the network to be added/removed
 * @param type the type of the network
 * @returns the updated citybike networks
 */

export const updateVehicleNetworks = (networks, networkName, type) => {
  let updatedNetworks;
  let toggleAction;

  if (networks.find(o => o.toLowerCase() === networkName.toLowerCase())) {
    updatedNetworks = without(networks, networkName, networkName.toUpperCase());
    toggleAction = 'Disable';
  } else {
    updatedNetworks = networks.concat([networkName]);
    toggleAction = 'Enable';
  }

  const action = `Settings${toggleAction}${
    type === 'citybike' ? 'CityBikeNetwork' : 'ScooterNetwork'
  }`;
  addAnalytics(action, networkName);

  return updatedNetworks;
};

export const openDeepLink = (deepLink, fallBackAddress) => {
  window.location.href = deepLink;
  setTimeout(() => {
    if (!document.hidden && document.hasFocus()) {
      // If the document is still visible and has focus, the deep link must have failed
      window.location.href = fallBackAddress;
    }
  }, 500);
};
