import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { dtLocationShape } from '../util/shapes';
import { navigateTo } from '../util/path';

import { startLocationWatch } from '../action/PositionActions';
import OriginSelectorRow from './OriginSelectorRow';
import PositionStore from '../store/PositionStore';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class GeopositionSelector extends React.Component {
  static propTypes = {
    destination: dtLocationShape,
    tab: PropTypes.string.isRequired,
    locationState: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }).isRequired,
  };

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = { initiatedGPS: false };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.locationState.status === PositionStore.STATUS_FOUND_LOCATION) {
      this.onPositioningStarted();
    }
  }

  onPositioningStarted = () => {
    if (this.state.initiatedGPS === true) {
      let destination = { ...this.props.destination };
      if (destination.gps === true) {
        destination = { ready: false, set: false };
      }
      navigateTo({
        origin: { gps: true, ready: false },
        destination,
        context: '/',
        router: this.context.router,
        base: this.context.router.location,
        tab: this.props.tab,
      });
    }
  };

  render() {
    return this.props.locationState.status ===
      PositionStore.STATUS_GEOLOCATION_NOT_SUPPORTED ? null : (
      <OriginSelectorRow
        key="panel-locationing-button"
        icon="icon-icon_position"
        onClick={() => {
          this.setState({ initiatedGPS: true });
          addAnalyticsEvent({
            action: 'EditJourneyStartPoint',
            category: 'ItinerarySettings',
            name: 'NearYouCurrentLocation',
          });
          this.context.executeAction(startLocationWatch);
        }}
        label={this.context.intl.formatMessage({
          id: 'use-own-position',
          defaultMessage: 'Use current location',
        })}
      />
    );
  }
}

export default connectToStores(
  GeopositionSelector,
  ['PositionStore'],
  context => ({
    locationState: context.getStore('PositionStore').getLocationState(),
  }),
);
