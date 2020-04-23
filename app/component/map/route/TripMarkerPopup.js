import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../util/path';

import RouteHeader from '../../RouteHeader';

import { addFavourite } from '../../../action/FavouriteActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';

function TripMarkerPopup(props) {
  let patternPath = `/${PREFIX_ROUTES}/${
    props.trip.route.gtfsId
  }/${PREFIX_STOPS}`;
  let tripPath = patternPath;

  if (props.trip.trip) {
    patternPath += `/${props.trip.trip.pattern.code}`;
    tripPath = `${patternPath}/${props.trip.trip.gtfsId}`;
  }

  return (
    <div className="card">
      <RouteHeader
        route={props.trip.route}
        pattern={props.trip.trip && props.trip.trip.pattern}
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
    route: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      mode: PropTypes.string,
    }).isRequired,
    trip: PropTypes.shape({
      gtfsId: PropTypes.string,
      pattern: PropTypes.shape({
        code: PropTypes.string.isRequired,
      }),
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
      .isFavourite(props.trip.route.gtfsId),
    addAsFavouriteRoute: e => {
      e.stopPropagation();
      context.executeAction(addFavourite, {
        type: 'route',
        gtfsId: props.trip.route.gtfsId,
      });
    },
  }),
);

const containerComponent = Relay.createContainer(TripMarkerPopupWithFavourite, {
  fragments: {
    trip: () => Relay.QL`
      fragment on QueryType {
        trip(id: $id) {
          gtfsId
          pattern {
            code
            headsign
            stops {
              name
            }
          }
        }
        route(id: $route) {
          gtfsId
          mode
          shortName
          longName
        }
      }
    `,
  },

  initialVariables: {
    route: null,
    id: null,
  },
});

export { containerComponent as default, TripMarkerPopup as Component };
