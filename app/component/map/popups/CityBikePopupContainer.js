import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import MarkerPopupBottom from '../MarkerPopupBottom';
import CityBikeContent from '../../CityBikeContent';
import CityBikeCardContainer from '../../CityBikeCardContainer';
import { station as exampleStation } from '../../ExampleData';
import ComponentUsageExample from '../../ComponentUsageExample';

class CityBikePopupContainer extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static description = (
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <CityBikePopupContainer
          context="context object here"
          station={exampleStation}
        >
          Im content of a citybike card
        </CityBikePopupContainer>
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'CityBikePopupContainer';

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

export default createFragmentContainer(CityBikePopupContainer, {
  station: graphql`
    fragment CityBikePopup_station on BikeRentalStation {
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
});
