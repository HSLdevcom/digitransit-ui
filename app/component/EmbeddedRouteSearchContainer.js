/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';

import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import LazilyLoad, { importLazy } from './LazilyLoad';

import withSearchContext from './WithSearchContext';
import { getStopRoutePath } from '../util/path';
import { useCitybikes } from '../util/modeUtils';

const modules = {
  EmbeddedRouteSearch: () => importLazy(import('./StopsNearYouContainer')),
};

// TODO pick the Embark site's path that deep-links into digitransit-ui's
const getEmbarkDigitransitDeeplink = (digitransitPath, embarkPath = '/') => {
  const newTopUrl = new URL('/', window.top.location.href);
  newTopUrl.pathname = embarkPath;
  newTopUrl.searchParams.set('dt-path', digitransitPath);
  return newTopUrl.href;
};

// eslint-disable-next-line react/prefer-stateless-function
class EmbeddedRouteSearchContainer extends React.Component {
  static contextTypes = {
    router: routerShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  render() {
    const { config } = this.context;
    const { lang } = this.props;
    const { trafficNowLink, colors, fontWeights } = config;
    const color = colors.primary;
    const hoverColor = colors.hover; // || LightenDarkenColor(colors.primary, -20);
    const accessiblePrimaryColor = colors.accessiblePrimary || colors.primary;
    const sources = ['Favourite', 'History', 'Datasource'];

    const StopRouteSearch = withSearchContext(DTAutoSuggest);
    const onSelectStopRoute = item => {
      const stopRoutePath = getStopRoutePath(item);
      window.top.location.href = getEmbarkDigitransitDeeplink(stopRoutePath);
    };

    const stopAndRouteSearchTargets = ['Stops', 'Routes'];
    if (useCitybikes(config.cityBike?.networks)) {
      stopAndRouteSearchTargets.push('BikeRentalStations');
    }
    if (config.includeParkAndRideSuggestions) {
      stopAndRouteSearchTargets.push('ParkingAreas');
    }

    const stopRouteSearchProps = {
      appElement: '#app',
      icon: 'search',
      id: 'stop-route-station',
      className: 'destination',
      placeholder: 'stop-near-you',
      selectHandler: onSelectStopRoute,
      getAutoSuggestIcons: config.getAutoSuggestIcons,
      value: '',
      // TODO
      lang: 'en',
      color,
      hoverColor,
      accessiblePrimaryColor,
      sources,
      targets: stopAndRouteSearchTargets,
      fontWeights,
      modeIconColors: config.colors.iconColors,
      modeSet: config.iconModeSet,
    };

    // TODO this path is not handled by digitransit-ui
    const systemAlertsPath = '/systemalerts';
    const planATripPath = '/'; // digitransit-ui start page
    return (
      <>
        <h2>Find A Ride</h2>
        <StopRouteSearch isMobile {...stopRouteSearchProps} />
        <span>
          <a
            href={getEmbarkDigitransitDeeplink(systemAlertsPath)}
            target="_parent"
          >
            System Alerts
          </a>
        </span>
        <span>
          <a
            href={getEmbarkDigitransitDeeplink(planATripPath)}
            target="_parent"
          >
            Plan A Trip
          </a>
        </span>
      </>
    );
  }
}

EmbeddedRouteSearchContainer.propTypes = {
  lang: PropTypes.string.isRequired,
  // match: matchShape.isRequired,
};

export default EmbeddedRouteSearchContainer;
