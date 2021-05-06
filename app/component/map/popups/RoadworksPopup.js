import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import ComponentUsageExample from '../../ComponentUsageExample';

class RoadworksPopup extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
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
      context: { intl },
    } = this;
    const duration = (
      <span className="inline-block padding-vertical-small">
        {RoadworksPopup.formatDateTime(
          properties.starttime,
          properties.endtime,
        )}
      </span>
    );

    const locationDescription = properties['location.location_description'];
    const url = properties.details_url;
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
            {locationDescription && <p>{locationDescription}</p>}
            <p>{properties.description}</p>
            {url && (
              <p>
                {/* eslint-disable-next-line react/jsx-no-target-blank */}
                <a href={url} target="_blank">
                  {intl.formatMessage({
                    id: 'extra-info',
                    defaultMessage: 'More information',
                  })}
                </a>
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }
}

export default RoadworksPopup;
