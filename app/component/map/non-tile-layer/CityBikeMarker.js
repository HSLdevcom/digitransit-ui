const isBrowser = typeof window !== 'undefined' && window !== null;
import React from 'react';
import Relay from 'react-relay';
import CityBikePopup from '../popups/CityBikePopup';
import provideContext from 'fluxible-addons-react/provideContext';
import { intlShape } from 'react-intl';
import Icon from '../../icon/icon';
import GenericMarker from '../GenericMarker';
import { station as exampleStation } from '../../documentation/ExampleData';
import ComponentUsageExample from '../../documentation/ComponentUsageExample';
import CityBikeRoute from '../../../route/CityBikeRoute';
import config from '../../../config';

let L;

/* eslint-disable global-require */
// TODO When server side rendering is re-enabled,
//      these need to be loaded only when isBrowser is true.
//      Perhaps still using the require from webpack?
if (isBrowser) {
  L = require('leaflet');
}
/* eslint-enable global-require */

const CityBikePopupWithContext = provideContext(CityBikePopup, {
  intl: intlShape.isRequired,
  router: React.PropTypes.object.isRequired,
  route: React.PropTypes.object.isRequired,
});

// Small icon for zoom levels <= 15
const smallIconSvg = `
  <svg viewBox="0 0 8 8">
    <circle class="stop-small" cx="4" cy="4" r="3" stroke-width="1"/>
  </svg>
`;

class CityBikeMarker extends React.Component {
  static description = (
    <div>
      <p>Renders a citybike marker</p>
      <ComponentUsageExample description="">
        <CityBikeMarker key={exampleStation.id} map="leaflet map here" station={exampleStation} />
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'CityBikeMarker';

  static propTypes = {
    station: React.PropTypes.object.isRequired,
    transit: React.PropTypes.bool,
  };

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    route: React.PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  getIcon = (zoom) => (
    (!this.props.transit && zoom <= config.stopsSmallMaxZoom) ?
      L.divIcon({
        html: smallIconSvg,
        iconSize: [8, 8],
        className: 'citybike cursor-pointer',
      })
    :
      L.divIcon({
        html: Icon.asString('icon-icon_citybike', 'city-bike-medium-size'),
        iconSize: [20, 20],
        className: 'citybike cursor-pointer',
      })
    )

  render() {
    if (!isBrowser) return false;
    return (
      <GenericMarker
        position={{
          lat: this.props.station.y,
          lon: this.props.station.x,
        }}
        getIcon={this.getIcon}
        id={this.props.station.id}
      >
        <Relay.RootContainer
          Component={CityBikePopup}
          route={new CityBikeRoute({ stationId: this.props.station.id })}
          renderLoading={() => (
            <div className="card" style={{ height: 150 }}>
              <div className="spinner-loader" />
            </div>
          )}
          renderFetched={data => (<CityBikePopupWithContext {...data} context={this.context} />)}
        />
      </GenericMarker>
    );
  }
}

export default CityBikeMarker;
