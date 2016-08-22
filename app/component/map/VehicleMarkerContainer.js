import React from 'react';
import Relay from 'react-relay';
import provideContext from 'fluxible-addons-react/provideContext';
import { intlShape } from 'react-intl';

import { startRealTimeClient, stopRealTimeClient } from '../../action/realTimeClientAction';
import Icon from '../icon/icon';
import RouteMarkerPopup from './route/route-marker-popup';
import FuzzyTripRoute from '../../route/FuzzyTripRoute';

const isBrowser = typeof window !== 'undefined' && window !== null;

let Popup;
let Marker;
let L;

/* eslint-disable global-require */
if (isBrowser) {
  Popup = require('react-leaflet/lib/Popup').default;
  Marker = require('react-leaflet/lib/Marker').default;
  L = require('leaflet');
}
/* eslint-enable global-require */

const RouteMarkerPopupWithContext = provideContext(RouteMarkerPopup, {
  intl: intlShape.isRequired,
  router: React.PropTypes.object.isRequired,
});

export default class VehicleMarkerContainer extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    startRealTimeClient: React.PropTypes.bool,
    trip: React.PropTypes.string,
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
      if (!this.props.trip || message.tripStartTime === this.props.trip) {
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

  getVehicleIcon(mode, heading) {
    if (!isBrowser) {
      return null;
    }

    const tailIcon = heading != null ? this.getTailIcon(mode, heading) : '';

    switch (mode) {
      case 'bus':
        return L.divIcon({
          html: tailIcon + Icon.asString('icon-icon_bus-live'),
          className: 'vehicle-icon bus',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
      case 'tram':
        return L.divIcon({
          html: tailIcon + Icon.asString('icon-icon_tram-live'),
          className: 'vehicle-icon tram',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
      case 'rail':
        return L.divIcon({
          html: tailIcon + Icon.asString('icon-icon_rail-live'),
          className: 'vehicle-icon rail',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
      case 'subway':
        return L.divIcon({
          html: tailIcon + Icon.asString('icon-icon_subway-live'),
          className: 'vehicle-icon subway',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
      case 'ferry':
        return L.divIcon({
          html: tailIcon + Icon.asString('icon-icon_ferry-live'),
          className: 'vehicle-icon ferry',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
      default:
        return L.divIcon({
          html: tailIcon + Icon.asString('icon-icon_bus-live'),
          className: 'vehicle-icon bus',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
    }
  }

  getTailIcon(mode, heading) {
    return `
      <span>
        <svg viewBox="0 0 40 40" className="${mode}"
          style="position: absolute; top: -20px; left: -20px; fill: currentColor;"
          width="60px" height="60px">
          <use
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xlink:href="#icon-icon_vehicle-live-shadow"
            transform="rotate(${heading} 20 20)"
          />
        </svg>
      </span>
    `;
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
        icon={this.getVehicleIcon(message.mode, message.heading)}
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
