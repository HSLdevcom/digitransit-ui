import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import MarkerPopupBottom from '../MarkerPopupBottom';
import ParkAndRideAvailability from './ParkAndRideAvailability';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import ComponentUsageExample from '../../ComponentUsageExample';

export default class ParkAndRidePopup extends React.Component {
  static contextTypes = { intl: intlShape.isRequired };

  static description = (
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <ParkAndRidePopup context="context object here">
          Im content of a citybike card
        </ParkAndRidePopup>
      </ComponentUsageExample>
    </div>
  );

  static propTypes = {
    realtime: PropTypes.bool.isRequired,
    maxCapacity: PropTypes.number.isRequired,
    spacesAvailable: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div className="card">
        <Card className="card-padding">
          <CardHeader
            name={this.context.intl.formatMessage({
              id: 'park-and-ride',
              defaultMessage: 'Park and Ride',
            })}
            description={this.props.name}
            icon="icon-icon_car"
            unlinked
          />
          <ParkAndRideAvailability
            realtime={this.props.realtime}
            maxCapacity={this.props.maxCapacity}
            spacesAvailable={this.props.spacesAvailable}
          />
        </Card>
        <MarkerPopupBottom
          location={{
            address: this.props.name,
            lat: this.props.lat,
            lon: this.props.lon,
          }}
        />
      </div>
    );
  }
}
