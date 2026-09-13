import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import { routePagePath, PREFIX_STOPS } from '../../../util/path';

import PopupHeader from './PopupHeader';

import { addAnalyticsEvent } from '../../../util/analyticsUtils';

function TripMarkerPopup({ trip, message }) {
  const patternPath = routePagePath(
    trip.route.gtfsId,
    PREFIX_STOPS,
    trip.pattern.code,
  );
  const tripPath = routePagePath(
    trip.route.gtfsId,
    PREFIX_STOPS,
    trip.pattern.code,
    trip.gtfsId,
  );

  return (
    <div className="card">
      <PopupHeader
        card
        route={trip.route}
        pattern={trip.pattern}
        startTime={message.tripStartTime}
      />
      <div className="bottom location">
        <Link
          to={tripPath}
          onClick={() => {
            addAnalyticsEvent({
              category: 'Map',
              action: 'OpenTripInformation',
              name: trip.route.mode,
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
      color: PropTypes.string,
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
        color
        type
      }
    }
  `,
});

export { containerComponent as default, TripMarkerPopup as Component };
