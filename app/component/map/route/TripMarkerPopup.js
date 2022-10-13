import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../util/path';

import RouteHeader from '../../RouteHeader';

import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import Icon from '../../Icon';

const drawOccupancy = status => {
  let suffix;
  switch (status) {
    case 'STANDING_ROOM_ONLY':
      suffix = 'high';
      break;
    case 'FEW_SEATS_AVAILABLE':
      suffix = 'medium';
      break;
    default:
      suffix = 'low';
      break;
  }
  return (
    // eslint-disable-next-line react/no-array-index-key
    <Icon img={`occupancy-${suffix}`} height={1.2} width={1.2} />
  );
};

function TripMarkerPopup(props) {
  if (!props.trip) {
    return null;
  }
  let patternPath = `/${PREFIX_ROUTES}/${props.trip.route.gtfsId}/${PREFIX_STOPS}`;
  let tripPath = patternPath;

  if (props.trip) {
    patternPath += `/${props.trip.pattern.code}`;
    tripPath = `${patternPath}/${props.trip.gtfsId}`;
  }

  return (
    <div className="card">
      <RouteHeader
        card
        route={props.trip.route}
        pattern={props.trip && props.trip.pattern}
        trip={props.message.tripStartTime}
      />
      <div className="direction">
        <FormattedMessage id="direction" />
        {props.trip.pattern.headsign}
      </div>
      {props.message.occupancyStatus && (
        <div className="occupancy">
          <div className="occupancy-icon">
            {drawOccupancy(props.message.occupancyStatus)}
          </div>
          <div>
            <FormattedMessage
              id={`occupancy-status-${props.message.occupancyStatus}`}
              defaultMessage={props.message.occupancyStatus}
            />
          </div>
        </div>
      )}
      <div className="position-disclaimer">
        {props.message.lastUpdate ? (
          <FormattedMessage
            id="position-disclaimer"
            values={{
              time: moment.unix(props.message.lastUpdate).format('LTS'),
            }}
          />
        ) : (
          <FormattedMessage id="position-estimated" />
        )}
      </div>
      <div className="bottom location">
        <Link
          to={tripPath}
          onClick={() => {
            addAnalyticsEvent({
              category: 'Map',
              action: 'OpenTripInformation',
              name: props.trip.route.mode,
            });
          }}
        >
          <FormattedMessage
            id="trip-information"
            defaultMessage="Trip Information"
          />
        </Link>
        <br />
        <Link to={patternPath} className="route">
          <FormattedMessage id="view-route" defaultMessage="View Route" />
        </Link>
      </div>
    </div>
  );
}

TripMarkerPopup.propTypes = {
  trip: PropTypes.shape({
    gtfsId: PropTypes.string,
    pattern: PropTypes.shape({
      code: PropTypes.string.isRequired,
      headsign: PropTypes.string,
    }),
    route: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      mode: PropTypes.string.isRequired,
      shortName: PropTypes.string,
      color: PropTypes.string,
    }).isRequired,
  }).isRequired,
  message: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    tripStartTime: PropTypes.string,
    occupancyStatus: PropTypes.string,
    lastUpdate: PropTypes.number,
  }).isRequired,
};

const containerComponent = createFragmentContainer(TripMarkerPopup, {
  trip: graphql`
    fragment TripMarkerPopup_trip on Trip {
      gtfsId
      pattern {
        code
        headsign
        stops {
          name
        }
      }
      route {
        gtfsId
        mode
        shortName
        color
        type
      }
    }
  `,
});

export { containerComponent as default, TripMarkerPopup as Component };
