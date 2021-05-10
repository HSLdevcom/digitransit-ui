import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import { station as exampleStation } from '../../ExampleData';
import ComponentUsageExample from '../../ComponentUsageExample';
import OSMOpeningHours from './OSMOpeningHours';
import Icon from '../../Icon';

class DynamicParkingLotsPopup extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static description = (
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <DynamicParkingLotsPopup
          context="context object here"
          station={exampleStation}
        >
          Im content of a citybike card
        </DynamicParkingLotsPopup>
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'ParkingLotPopup';

  static propTypes = {
    feature: PropTypes.object.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    icon: PropTypes.string,
  };

  getCapacity() {
    const { intl } = this.context;
    let text;
    if (
      this.props.feature.properties &&
      typeof this.props.feature.properties.free === 'number'
    ) {
      text = intl.formatMessage(
        {
          id: 'parking-spaces-available',
          defaultMessage: '{free} of {total} parking spaces available',
        },
        this.props.feature.properties,
      );
    } else {
      text = intl.formatMessage(
        {
          id: 'parking-spaces-in-total',
          defaultMessage: 'Capacity: {total} parking spaces',
        },
        this.props.feature.properties,
      );
    }

    return <span className="inline-block padding-vertical-small">{text}</span>;
  }

  getUrl() {
    const { intl } = this.context;
    if (this.props.feature.properties && this.props.feature.properties.url) {
      return (
        <div className="padding-vertical-small">
          <a
            href={this.props.feature.properties.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {intl.formatMessage({
              id: 'extra-info',
              defaultMessage: 'More information',
            })}
          </a>
        </div>
      );
    }
    return null;
  }

  renderOpeningHours() {
    const {
      feature: { properties },
    } = this.props;
    const openingHours = properties.opening_hours;
    if (openingHours) {
      return <OSMOpeningHours openingHours={openingHours} displayStatus />;
    }
    return null;
  }

  render() {
    return (
      <div className="card dynamic-parking-lot-popup">
        <Card className="card-padding">
          {this.props.icon ? (
            <div className="left card-icon">
              <Icon img={this.props.icon} />
            </div>
          ) : null}
          <h2 style={{ marginTop: 3 }}>{this.props.feature.properties.name}</h2>
          {this.getCapacity()}
          <div>
            {this.renderOpeningHours()}
            {this.getUrl()}
          </div>
        </Card>
        <MarkerPopupBottom
          location={{
            address: this.props.feature.properties.name,
            lat: this.props.lat,
            lon: this.props.lon,
          }}
        />
      </div>
    );
  }
}

DynamicParkingLotsPopup.contextTypes = {
  intl: intlShape.isRequired,
};

export default DynamicParkingLotsPopup;
