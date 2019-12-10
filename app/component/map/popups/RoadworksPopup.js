import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import moment from 'moment';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import ComponentUsageExample from '../../ComponentUsageExample';

class RoadworksPopup extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static description = (
    <div>
      <p>Renders a roadworks popup.</p>
      <ComponentUsageExample description="">
        <RoadworksPopup context="context object here">
          Im content of a roadworks card
        </RoadworksPopup>
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'RoadworksPopup';

  static propTypes = {};

  formatDate(date) {
    return date.format('ll');
  }

  formatTime(dateTime) {
    return dateTime.format('LT');
  }

  formatDateTime(start, end, type) {
    const startM = moment(start).tz('Europe/Berlin');
    const endM = moment(end).tz('Europe/Berlin');
    if(type === "Langzeitbaustelle"){
      return `${this.formatDate(startM)} - ${this.formatDate(endM)}`;
    } else {
      return `${this.formatDate(startM)} - ${this.formatDate(endM)}, ${this.formatTime(startM)} - ${this.formatTime(endM)}`;
    }
  }

  render() {
    const properties = this.props.feature.properties;
    const duration = this.formatDateTime(properties.gueltig_von, properties.gueltig_bis, properties.Baustellenart);
    return (
      <Card>
        <div className="padding-small">
          <CardHeader
            name={properties.Baustellenbeschreibung}
            description={properties.Baustellenart}
            unlinked
            className="padding-small"
          />
          <div>
            <p>
              {duration}
            </p>
          </div>
        </div>
      </Card>
    );
  }
}

export default Relay.createContainer(RoadworksPopup, { fragments: {} });
