import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Link from 'found/lib/Link';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { PREFIX_ROUTES } from '../../../util/path';

import RouteHeader from '../../RouteHeader';

import { addFavourite } from '../../../action/FavouriteActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';

function TripMarkerPopup(props) {
  let patternPath = `/${PREFIX_ROUTES}/${props.route.gtfsId}/pysakit`;
  let tripPath = patternPath;

  if (props.trip) {
    patternPath += `/${props.trip.pattern.code}`;
    tripPath = `${patternPath}/${props.trip.gtfsId}`;
  }

  return (
    <div className="card">
      <RouteHeader
        route={props.route}
        pattern={props.trip && props.trip.pattern}
        trip={props.message.tripStartTime}
        favourite={props.favourite}
        addFavouriteRoute={props.addAsFavouriteRoute}
      />
      <div className="bottom location">
        <Link
          to={tripPath}
          onClick={() => {
            addAnalyticsEvent({
              category: 'Map',
              action: 'OpenTripInformation',
              name: props.route.mode,
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
  route: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
    mode: PropTypes.string,
  }).isRequired,
  trip: PropTypes.shape({
    gtfsId: PropTypes.string,
    pattern: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }),
  }).isRequired,
  favourite: PropTypes.bool.isRequired,
  addAsFavouriteRoute: PropTypes.func.isRequired,
  message: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    tripStartTime: PropTypes.string,
  }).isRequired,
};

const TripMarkerPopupWithFavourite = connectToStores(
  TripMarkerPopup,
  ['FavouriteStore'],
  (context, props) => ({
    favourite: context
      .getStore('FavouriteStore')
      .isFavourite(props.route.gtfsId),
    addAsFavouriteRoute: e => {
      e.stopPropagation();
      context.executeAction(addFavourite, {
        type: 'route',
        gtfsId: props.route.gtfsId,
      });
    },
  }),
);

const containerComponent = createFragmentContainer(
  TripMarkerPopupWithFavourite,
  {
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
      }
    `,
    route: graphql`
      fragment TripMarkerPopup_route on Route {
        gtfsId
        mode
        shortName
        longName
      }
    `,
  },
);

export { containerComponent as default, TripMarkerPopup as Component };
