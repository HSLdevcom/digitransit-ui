import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import { station as exampleStation } from '../../ExampleData';
import ComponentUsageExample from '../../ComponentUsageExample';
import OSMOpeningHours from './OSMOpeningHours';
import ChargingStations from '../tile-layer/ChargingStations';

class ChargingStationPopup extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static description = (
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <ChargingStationPopup
          context="context object here"
          station={exampleStation}
        >
          Im content of a citybike card
        </ChargingStationPopup>
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'ParkingLotPopup';

  static propTypes = {
    name: PropTypes.string,
    vehicleType: PropTypes.string.isRequired,
    openingHours: PropTypes.string,
    capacity: PropTypes.number,
    occupied: PropTypes.number,
    fee: PropTypes.bool,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  };

  getCapacity() {
    const { intl } = this.context;
    const { capacity, occupied } = this.props;
    const available = capacity - occupied;

    if (typeof available === 'number' && typeof occupied === 'number') {
      return intl.formatMessage(
        {
          id: 'charging-spaces-available',
          defaultMessage: '{available} of {capacity} parking spaces available',
        },
        { capacity, available },
      );
    }

    if (typeof capacity === 'number') {
      return intl.formatMessage(
        {
          id: 'charging-spaces-in-total',
          defaultMessage: 'Capacity: {capacity} parking spaces',
        },
        this.props,
      );
    }
    return null;
  }

  getOpeningHours() {
    const { openingHours } = this.props;

    if (openingHours) {
      return <OSMOpeningHours openingHours={openingHours} />;
    }
    return null;
  }

  getFee() {
    const { intl } = this.context;
    const { fee } = this.props;

    if (fee === true) {
      return intl.formatMessage({
        id: 'charging-not-free',
        defaultMessage: 'Charging occurs a fee',
      });
    }
    if (fee === true) {
      return intl.formatMessage({
        id: 'charging-free',
        defaultMessage: 'Charging is free',
      });
    }
    return null;
  }

  static getName = (name, vehicleType, intl) =>
    name ||
    intl.formatMessage({
      id: `${vehicleType}-charging-station`,
      defaultMessage: `${vehicleType} charging station`,
    });

  render() {
    const { lat, lon, name, vehicleType } = this.props;
    const { intl } = this.context;
    const normalizedName = ChargingStationPopup.getName(
      name,
      vehicleType,
      intl,
    );
    return (
      <Card>
        <div className="padding-normal charging-station-popup">
          <CardHeader
            name={normalizedName}
            descClass="padding-vertical-small"
            unlinked
            icon={ChargingStations.getIcon(this.props)}
            className="padding-medium"
            headingStyle="h2"
            description=""
          />
          <div className="content">
            <div>{this.getCapacity()}</div>
            <div>{this.getFee()}</div>
          </div>
          <div>{this.getOpeningHours()}</div>
        </div>
        <MarkerPopupBottom
          onSelectLocation={() => {}}
          location={{
            address: normalizedName,
            lat,
            lon,
          }}
        />
      </Card>
    );
  }
}

export default ChargingStationPopup;
