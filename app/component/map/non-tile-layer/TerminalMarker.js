import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import provideContext from 'fluxible-addons-react/provideContext';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import { getDistanceToFurthestStop } from '../../../util/geo-utils';
import Icon from '../../Icon';
import StopMarkerPopup from '../popups/StopMarkerPopup';
import GenericMarker from '../GenericMarker';
import TerminalRoute from '../../../route/TerminalRoute';
import Loading from '../../Loading';

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
  route: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
});

class TerminalMarker extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    route: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    terminal: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      gtfsId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      stops: PropTypes.array,
    }).isRequired,
    mode: PropTypes.string.isRequired,
    selected: PropTypes.bool,
    renderName: PropTypes.string,
  };

  getIcon = () =>
    L.divIcon({
      html: Icon.asString(
        'icon-icon_mapMarker-station',
        'terminal-medium-size',
      ),
      iconSize: [24, 24],
      className: `${this.props.mode} cursor-pointer`,
    });

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
          route={
            new TerminalRoute({
              terminalId: this.props.terminal.gtfsId,
              date: this.context
                .getStore('TimeStore')
                .getCurrentTime()
                .format('YYYYMMDD'),
            })
          }
          renderLoading={() =>
            <div className="card" style={{ height: '12rem' }}>
              <Loading />
            </div>}
          renderFetched={data =>
            <StopMarkerPopupWithContext {...data} context={this.context} />}
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
          center={{
            lat: this.props.terminal.lat,
            lng: this.props.terminal.lon,
          }}
          radius={
            getDistanceToFurthestStop(
              new L.LatLng(this.props.terminal.lat, this.props.terminal.lon),
              this.props.terminal.stops,
            ).distance
          }
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
