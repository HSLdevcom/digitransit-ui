import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import { startLocationWatch } from '../action/PositionActions';
import PositionStore from '../store/PositionStore';
import Icon from './Icon';
import { setUseCurrent } from '../action/EndpointActions';
import Loading from './Loading';

const GeopositionSelector = ({ origin, status, searchModalIsOpen }, context) => {
  /* States:
   * - locationing hasn't been started
   * . locationing in progress
   * . locationing denied
   * . locationing failed
   * - locationing succeeded
   */

  // sets origin to 'current locationä if search modal is not open
  if ((status === PositionStore.STATUS_FOUND_LOCATION ||
    status === PositionStore.STATUS_FOUND_ADDRESS)
    && !searchModalIsOpen && !origin.userSetPosition && !origin.useCurrentPosition) {
    context.executeAction(setUseCurrent, {
      target: 'origin',
      keepSelectedLocation: true, // don't overwrite if user has already set a location
      router: context.router,
      location: context.location,
    });
  }

  if (status === PositionStore.STATUS_NO_LOCATION) {
    return (
      <div className="splash-locationing-button-container">
        <button id="splash-locationing-button" className="noborder standalone-btn" tabIndex="0" onClick={() => context.executeAction(startLocationWatch)}>
          <Icon className="icon-positioning" img="icon-icon_position" />
          <FormattedMessage
            id="splash-use-positioning"
            defaultMessage="Use location services"
          />
        </button>
      </div>
    );
  } else if (status === PositionStore.STATUS_SEARCHING_LOCATION) {
    return (
      <div id="geoposition-selector">
        <Loading />
        <div className="spinner-caption">
          <FormattedMessage id="splash-locating" defaultMessage="Detecting location" />…
        </div>
      </div>);
  } else if (status === PositionStore.STATUS_GEOLOCATION_DENIED) {
    return (<div id="splash-positioning-message"><FormattedMessage
      id="splash-geolocation-denied-message"
      defaultMessage="You have not enabled location services. You can enable location services in your browser or phone settings."
    /></div>);
  } else if (status === PositionStore.STATUS_GEOLOCATION_WATCH_TIMEOUT) {
    return (<div id="splash-positioning-message"><FormattedMessage
      id="splash-geolocation-watch-timeout-message"
      defaultMessage="Detecting your location is taking longer than expected. Have you accepted your browser’s request to access your location?"
    /></div>);
  } else if (status === PositionStore.STATUS_GEOLOCATION_NOT_SUPPORTED) {
    return (<div id="splash-positioning-message"><FormattedMessage
      id="splash-geolocation-not-supported-message"
      defaultMessage="Location services unavailable."
    /></div>);
  } else if (status === PositionStore.STATUS_GEOLOCATION_PROMPT) {
    return (<div id="splash-positioning-message"><FormattedMessage
      id="splash-geolocation-prompt-message"
      defaultMessage="Accept your browser’s request to access your location."
    /></div>);
  }
  return null;
};

GeopositionSelector.propTypes = {
  status: React.PropTypes.string.isRequired,
  searchModalIsOpen: React.PropTypes.bool.isRequired,
  origin: React.PropTypes.object,
};

GeopositionSelector.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
  router: routerShape.isRequired,
  location: locationShape.isRequired,
};

export default connectToStores(
  GeopositionSelector,
  ['PositionStore', 'EndpointStore'],
  context => (
    { status: context.getStore('PositionStore').getLocationState().status,
      origin: context.getStore('EndpointStore').getOrigin() }
  ));
