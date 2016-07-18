const isBrowser = typeof window !== 'undefined' && window !== null;
import React from 'react';
import Relay from 'react-relay';
import CityBikePopup from '../popups/city-bike-popup';
import provideContext from 'fluxible-addons-react/provideContext';
import { intlShape } from 'react-intl';
import Icon from '../../icon/icon';
import GenericMarker from '../GenericMarker';
import { station as exampleStation } from '../../documentation/ExampleData';
import ComponentUsageExample from '../../documentation/ComponentUsageExample';
import CityBikeRoute from '../../../route/CityBikeRoute';

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

  getCityBikeMediumIcon() {
    return Icon.asString('icon-icon_citybike', 'city-bike-medium-size');
  }

  getCityBikeMarker() {
    let iconSmall = smallIconSvg;
    let iconSmallSize = [8, 8];
    const iconMedium = this.getCityBikeMediumIcon();
    const iconMediumSize = [20, 20];

    if (this.props.transit) {
      iconSmall = iconMedium;
      iconSmallSize = [20, 20];
    }

    return (
      <GenericMarker
        position={{
          lat: this.props.station.y,
          lon: this.props.station.x,
        }}
        icons={{
          smallIconSvg: iconSmall,
          iconSvg: iconMedium,
        }}
        iconSizes={{
          smallIconSvg: iconSmallSize,
          iconSvg: iconMediumSize,
        }}
        mode="citybike"
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

  render() {
    if (!isBrowser) return false;
    return this.getCityBikeMarker();
  }
}

export default CityBikeMarker;
