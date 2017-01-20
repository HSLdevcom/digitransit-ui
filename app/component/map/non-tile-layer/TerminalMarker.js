import React from 'react';
import Relay from 'react-relay';
import provideContext from 'fluxible-addons-react/provideContext';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import { getDistanceToFurthestStop } from '../../../util/geo-utils';
import Icon from '../../Icon';
import StopMarkerPopup from '../popups/StopMarkerPopup';
import GenericMarker from '../GenericMarker';
import TerminalRoute from '../../../route/TerminalRoute';

import { isBrowser } from '../../../util/browser';

let Circle;
let L;

/* eslint-disable global-require */
if (isBrowser) {
  Circle = require('react-leaflet/lib/Circle').default;
  L = require('leaflet');
}
/* eslint-enable global-require */

const StopMarkerPopupWithContext = provideContext(StopMarkerPopup, {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  location: locationShape.isRequired,
  route: React.PropTypes.object.isRequired,
  config: React.PropTypes.object.isRequired,
});

class TerminalMarker extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    route: React.PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    config: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    terminal: React.PropTypes.shape({
      lat: React.PropTypes.number.isRequired,
      lon: React.PropTypes.number.isRequired,
      gtfsId: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired,
      stops: React.PropTypes.array,
    }).isRequired,
    mode: React.PropTypes.string.isRequired,
    selected: React.PropTypes.bool,
    renderName: React.PropTypes.string,
  }

  getIcon = () =>
    L.divIcon({
      html: Icon.asString('icon-icon_mapMarker-station', 'terminal-medium-size'),
      iconSize: [24, 24],
      className: `${this.props.mode} cursor-pointer`,
    })

  getTerminalMarker() {
    return (
      <GenericMarker
        position={{
          lat: this.props.terminal.lat,
          lon: this.props.terminal.lon,
        }}
        getIcon={this.getIcon}
        id={this.props.terminal.gtfsId}
        renderName={this.props.renderName}
        name={this.props.terminal.name}
      >
        <Relay.RootContainer
          Component={StopMarkerPopup}
          route={new TerminalRoute({
            terminalId: this.props.terminal.gtfsId,
            date: this.context.getStore('TimeStore').getCurrentTime().format('YYYYMMDD'),
          })}
          renderLoading={() => (
            <div className="card" style={{ height: '12rem' }}><div className="spinner-loader" /></div>
          )}
          renderFetched={data => (
            <StopMarkerPopupWithContext {...data} context={this.context} />
          )}
        />
      </GenericMarker>
    );
  }

  render() {
    if (!isBrowser) {
      return '';
    }

    return (
      <div>
        <Circle
          center={{ lat: this.props.terminal.lat, lng: this.props.terminal.lon }}
          radius={getDistanceToFurthestStop(
            new L.LatLng(this.props.terminal.lat, this.props.terminal.lon),
            this.props.terminal.stops,
          ).distance}
          fillOpacity={0.05}
          weight={1}
          opacity={0.3}
          className={this.props.mode}
          fillColor="currentColor"
          color="currentColor"
        />
        {this.getTerminalMarker()}
      </div>
    );
  }
}

export default TerminalMarker;
