import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { Link, routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape } from 'react-intl';

import RouteHeader from '../../RouteHeader';

import { addFavouriteRoute } from '../../../action/FavouriteActions';

class RouteMarkerPopup extends React.Component {
  static childContextTypes = {
    router: routerShape.isRequired,
  };

  static propTypes = {
    context: PropTypes.shape({
      router: routerShape.isRequired,
      intl: intlShape.isRequired,
      executeAction: PropTypes.func.isRequired,
    }).isRequired,
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
    favourite: PropTypes.bool,
    message: PropTypes.shape({
      mode: PropTypes.string.isRequired,
      tripStartTime: PropTypes.string.isRequired,
    }).isRequired,
  };

  getChildContext() {
    return {
      router: this.props.context.router,
    };
  }

  addAsFavouriteRoute = e => {
    e.stopPropagation();
    this.props.context.executeAction(
      addFavouriteRoute,
      this.props.trip.route.gtfsId,
    );
  };

  render() {
    let patternPath = `/linjat/${this.props.trip.route.gtfsId}/pysakit`;
    let tripPath = patternPath;

    if (this.props.trip.fuzzyTrip) {
      patternPath += `/${this.props.trip.fuzzyTrip.pattern.code}`;
      tripPath = `${patternPath}/${this.props.trip.fuzzyTrip.gtfsId}`;
    }

    return (
      <div className="card">
        <RouteHeader
          route={this.props.trip.route}
          pattern={
            this.props.trip.fuzzyTrip && this.props.trip.fuzzyTrip.pattern
          }
          trip={this.props.message.tripStartTime}
          favourite={this.props.favourite}
          addFavouriteRoute={this.addAsFavouriteRoute}
        />
        <div className="bottom location">
          <Link to={tripPath}>
            {this.props.context.intl.formatMessage({
              id: 'trip-information',
              defaultMessage: 'Trip Information',
            })}
          </Link>
          <br />
          <Link to={patternPath} className="route">
            {this.props.context.intl.formatMessage({
              id: 'view-route',
              defaultMessage: 'View Route',
            })}
          </Link>
        </div>
      </div>
    );
  }
}

const RouteMarkerPopupWithFavourite = connectToStores(
  RouteMarkerPopup,
  ['FavouriteRoutesStore'],
  (context, props) => ({
    favourite: context
      .getStore('FavouriteRoutesStore')
      .isFavourite(props.trip.route.gtfsId),
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
