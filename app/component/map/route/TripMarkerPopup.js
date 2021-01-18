import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../util/path';

import RouteHeader from '../../RouteHeader';

import { addAnalyticsEvent } from '../../../util/analyticsUtils';

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
    }),
    route: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      mode: PropTypes.string.isRequired,
      shortName: PropTypes.string,
    }).isRequired,
  }).isRequired,
  message: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    tripStartTime: PropTypes.string,
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
      }
    }
  `,
});

export { containerComponent as default, TripMarkerPopup as Component };
