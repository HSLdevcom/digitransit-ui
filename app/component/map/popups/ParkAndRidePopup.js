import React from 'react';
import { intlShape } from 'react-intl';

import MarkerPopupBottom from '../MarkerPopupBottom';
import ParkAndRideAvailability from './ParkAndRideAvailability';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import ComponentUsageExample from '../../ComponentUsageExample';

export default class ParkAndRidePopup extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    intl: intlShape,
  };

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
    realtime: React.PropTypes.bool.isRequired,
    maxCapacity: React.PropTypes.number.isRequired,
    spacesAvailable: React.PropTypes.number.isRequired,
    context: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
  };

  render() {
    return (
      <div className="card">
        <Card className="padding-small">
          <CardHeader
            name={this.context.intl.formatMessage({
              id: 'park-and-ride',
              defaultMessage: 'Park and ride',
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
