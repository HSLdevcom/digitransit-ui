import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { PREFIX_ROUTES } from '../../../util/path';

import RouteHeader from '../../RouteHeader';

import { addFavouriteRoute } from '../../../action/FavouriteActions';

function RouteMarkerPopup(props) {
  let patternPath = `/${PREFIX_ROUTES}/${props.trip.route.gtfsId}/pysakit`;
  let tripPath = patternPath;

  if (props.trip.fuzzyTrip) {
    patternPath += `/${props.trip.fuzzyTrip.pattern.code}`;
    tripPath = `${patternPath}/${props.trip.fuzzyTrip.gtfsId}`;
  }

  return (
    <div className="card">
      <RouteHeader
        route={props.trip.route}
        pattern={props.trip.fuzzyTrip && props.trip.fuzzyTrip.pattern}
        trip={props.message.tripStartTime}
        favourite={props.favourite}
        addFavouriteRoute={props.addAsFavouriteRoute}
      />
      <div className="bottom location">
        <Link to={tripPath}>
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

RouteMarkerPopup.propTypes = {
  trip: PropTypes.shape({
    route: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
    }).isRequired,
    fuzzyTrip: PropTypes.shape({
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
    tripStartTime: PropTypes.string.isRequired,
  }).isRequired,
};

const RouteMarkerPopupWithFavourite = connectToStores(
  RouteMarkerPopup,
  ['FavouriteRoutesStore'],
  (context, props) => ({
    favourite: context
      .getStore('FavouriteRoutesStore')
      .isFavourite(props.trip.route.gtfsId),
    addAsFavouriteRoute: e => {
      e.stopPropagation();
      context.executeAction(addFavouriteRoute, props.trip.route.gtfsId);
    },
  }),
);

export default Relay.createContainer(RouteMarkerPopupWithFavourite, {
  fragments: {
    trip: () => Relay.QL`
      fragment on QueryType {
        fuzzyTrip(route: $route, direction: $direction, time: $time, date: $date) {
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
    direction: null,
    date: null,
    time: null,
  },
});
