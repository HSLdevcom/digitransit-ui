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
      window.top.location.href = getStopRoutePath(item);
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
    return (
      <div className="embedded-seach-container" id="#app">
        <div className="control-panel-container">
          <h1>Find A Ride</h1>
          <StopRouteSearch isMobile {...stopRouteSearchProps} />
          <ul
            style={{ listStyle: 'none', paddingLeft: 0, fontWeight: 'normal' }}
          >
            <li style={{ display: 'inline-block', marginLeft: '1em' }}>
              <a
                href={systemAlertsPath}
                target="_top"
                style={{ color: 'red', textDecoration: 'none' }}
              >
                System Alerts
              </a>
            </li>
            <li style={{ display: 'inline-block', marginLeft: '1em' }}>
              <a
                href="/"
                target="_top"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                Plan A Trip
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

EmbeddedRouteSearchContainer.propTypes = {
  lang: PropTypes.string.isRequired,
  // match: matchShape.isRequired,
};

export default EmbeddedRouteSearchContainer;
