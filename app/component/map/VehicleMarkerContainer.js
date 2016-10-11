import React, { PropTypes } from 'react';
import Relay from 'react-relay';
import provideContext from 'fluxible-addons-react/provideContext';
import { intlShape } from 'react-intl';

import { startRealTimeClient, stopRealTimeClient } from '../../action/realTimeClientAction';
import RouteMarkerPopup from './route/RouteMarkerPopup';
import FuzzyTripRoute from '../../route/FuzzyTripRoute';
import { asString as iconAsString } from '../icon/IconWithTail';

const isBrowser = typeof window !== 'undefined' && window !== null;

const MODES_WITH_ICONS = ['bus', 'tram', 'rail', 'subway', 'ferry'];

let Popup;
let Marker;
let L;


if (isBrowser) {
  /* eslint-disable global-require */
  Popup = require('react-leaflet/lib/Popup').default;
  Marker = require('react-leaflet/lib/Marker').default;
  L = require('leaflet');
  /* eslint-enable global-require */
}

const RouteMarkerPopupWithContext = provideContext(RouteMarkerPopup, {
  intl: intlShape.isRequired,
  router: PropTypes.object.isRequired,
});

export default class VehicleMarkerContainer extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    startRealTimeClient: PropTypes.bool,
    tripStartTime: PropTypes.string,
    useSmallIcons: PropTypes.bool,
  }

  componentWillMount() {
    if (this.props.startRealTimeClient) {
      this.context.executeAction(startRealTimeClient);
    }

    this.context.getStore('RealTimeInformationStore').addChangeListener(this.onChange);

    const vehicles = this.context.getStore('RealTimeInformationStore').vehicles;

    Object.keys(vehicles).forEach(id => {
      // if tripStartTime has been specified,
      // use only the updates for vehicles with matching startTime
      const message = vehicles[id];
      if (!this.props.tripStartTime || message.tripStartTime === this.props.tripStartTime) {
        this.updateVehicle(id, message);
      }
    });
  }

  componentWillUnmount() {
    if (
      this.props.startRealTimeClient && this.context.getStore('RealTimeInformationStore').client
    ) {
      this.context.executeAction(stopRealTimeClient(
        this.context.getStore('RealTimeInformationStore').client
      ));
    }
    this.context.getStore('RealTimeInformationStore').removeChangeListener(this.onChange);
  }

  onChange = (id) => {
    const message = this.context.getStore('RealTimeInformationStore').getVehicle(id);
    this.updateVehicle(id, message);
  }

  getVehicleIcon(mode, heading, useSmallIcon = false) {
    if (!isBrowser) {
      return null;
    }

    if (MODES_WITH_ICONS.indexOf(mode) !== -1) {
      return L.divIcon({
        html: iconAsString({ img: `icon-icon_${mode}-live`, rotate: heading }),
        className: `vehicle-icon ${mode} ${useSmallIcon ? 'small-map-icon' : ''}`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
    }

    return L.divIcon({
      html: iconAsString({ img: 'icon-icon_bus-live', rotate: heading }),
      className: `vehicle-icon bus ${useSmallIcon ? 'small-map-icon' : ''}`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }


  vehicles = {};

  updateVehicle(id, message) {
    const popup = (
      <Relay.RootContainer
        Component={RouteMarkerPopup}
        route={new FuzzyTripRoute({
          route: message.route,
          direction: message.direction,
          date: message.operatingDay,
          time:
            (message.tripStartTime.substring(0, 2) * 60 * 60) +
            (message.tripStartTime.substring(2, 4) * 60),
        })}
        renderLoading={() => (
          <div className="card" style={{ height: 150 }}><div className="spinner-loader" /></div>
        )}
        renderFetched={data => (
          <RouteMarkerPopupWithContext {...data} message={message} context={this.context} />
        )}
      />);

    this.vehicles[id] = (
      <Marker
        key={id}
        position={{
          lat: message.lat,
          lng: message.long,
        }}
        icon={this.getVehicleIcon(message.mode, message.heading, this.props.useSmallIcons)}
      >
        <Popup
          offset={[106, 16]}
          closeButton={false}
          maxWidth={250}
          minWidth={250}
          className="popup"
        >
          {popup}
        </Popup>
      </Marker>
    );

    this.forceUpdate();
  }

  render() {
    return (
      <div>
        {Object.keys(this.vehicles).map(key => this.vehicles[key])}
      </div>
    );
  }
}
