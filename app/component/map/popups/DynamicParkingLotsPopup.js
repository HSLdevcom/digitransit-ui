import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import CityBikeContent from '../../CityBikeContent';
import CityBikeCardContainer from '../../CityBikeCardContainer';
import { station as exampleStation } from '../../ExampleData';
import ComponentUsageExample from '../../ComponentUsageExample';

class DynamicParkingLotsPopup extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static description = (
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <DynamicParkingLotsPopup context="context object here" station={exampleStation}>
          Im content of a citybike card
        </DynamicParkingLotsPopup>
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'CityBikePopup';

  static propTypes = {
    //station: PropTypes.object.isRequired,
  };

  render() {
    //console.log(this)
    return (
      <Card>
        <div className="padding-small">
          <CardHeader
            name={this.props.feature.properties.name}
            description={`${this.props.feature.properties.currentCapacity} von ${this.props.feature.properties.capacity} Parkplätzen verfügbar`}
            unlinked
            className="padding-small"
          >
            
          </CardHeader>
        </div>
        <MarkerPopupBottom
          location={{
            address: this.props.feature.properties.name,
            lat: this.props.lat,
            lon: this.props.lon,
          }}
        />
      </Card>
    );
  }
}

export default Relay.createContainer(DynamicParkingLotsPopup, {
  fragments: {
    /*station: () => Relay.QL`
      fragment on BikeRentalStation {
        stationId
        name
        lat
        lon
        bikesAvailable
        spacesAvailable
        state
      }
    `,*/
  },
});
