import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import MarkerPopupBottom from '../MarkerPopupBottom';
import CityBikeContent from '../../CityBikeContent';
import CityBikeCardContainer from '../../CityBikeCardContainer';
import { station as exampleStation } from '../../ExampleData';
import ComponentUsageExample from '../../ComponentUsageExample';

class CityBikePopup extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static description = (
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <CityBikePopup context="context object here" station={exampleStation}>
          Im content of a citybike card
        </CityBikePopup>
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'CityBikePopup';

  static propTypes = {
    station: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className="card">
        <CityBikeCardContainer
          className="card-padding"
          station={this.props.station}
        >
          <CityBikeContent
            lang={this.context.getStore('PreferencesStore').getLanguage()}
            station={this.props.station}
          />
        </CityBikeCardContainer>
        <MarkerPopupBottom
          location={{
            address: this.props.station.name,
            lat: this.props.station.lat,
            lon: this.props.station.lon,
          }}
        />
      </div>
    );
  }
}

export default Relay.createContainer(CityBikePopup, {
  fragments: {
    station: () => Relay.QL`
      fragment on BikeRentalStation {
        stationId
        name
        lat
        lon
        bikesAvailable
        spacesAvailable
        state
        networks
      }
    `,
  },
});
