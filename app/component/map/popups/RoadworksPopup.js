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

  static formatDateTime(start, end) {
    const startM = moment(start);
    const endM = moment(end);
    return `${RoadworksPopup.formatDate(startM)} - ${RoadworksPopup.formatDate(
      endM,
    )}`;
  }

  render() {
    const {
      props: {
        feature: { properties },
      },
    } = this;
    const duration = (
      <span className="inline-block padding-vertical-small">
        {RoadworksPopup.formatDateTime(
          properties.starttime,
          properties.endtime,
        )}
      </span>
    );

    return (
      <Card>
        <div className="padding-normal">
          <CardHeader
            name={properties['location.street']}
            description={duration}
            unlinked
            className="padding-medium"
            headingStyle="h2"
          />
          <div>
            <p>{properties.description}</p>
          </div>
        </div>
      </Card>
    );
  }
}

export default Relay.createContainer(RoadworksPopup, { fragments: {} });
