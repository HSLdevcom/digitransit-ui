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

  static propTypes = {
    feature: PropTypes.object,
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

  static formatDate(date) {
    return date.format('ll');
  }

  static formatTime(dateTime) {
    return dateTime.format('LT');
  }

  static formatDateTime(start, end, type) {
    const startM = moment(start).tz('Europe/Berlin');
    const endM = moment(end).tz('Europe/Berlin');
    if (type === 'Langzeitbaustelle') {
      return `${RoadworksPopup.formatDate(
        startM,
      )} - ${RoadworksPopup.formatDate(endM)}`;
    }
    return `${RoadworksPopup.formatDate(startM)} - ${RoadworksPopup.formatDate(
      endM,
    )}, ${RoadworksPopup.formatTime(startM)} - ${RoadworksPopup.formatTime(
      endM,
    )}`;
  }

  render() {
    const {
      props: {
        feature: { properties },
      },
    } = this;
    const duration = RoadworksPopup.formatDateTime(
      properties.gueltig_von,
      properties.gueltig_bis,
      properties.Baustellenart,
    );
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
            <p>{duration}</p>
          </div>
        </div>
      </Card>
    );
  }
}

export default Relay.createContainer(RoadworksPopup, { fragments: {} });
