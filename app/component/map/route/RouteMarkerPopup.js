import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { Link } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape } from 'react-intl';

import RouteHeader from '../../RouteHeader';

import { addFavouriteRoute } from '../../../action/FavouriteActions';

class RouteMarkerPopup extends React.Component {
  static childContextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    context: PropTypes.shape({
      router: PropTypes.object.isRequired,
      intl: intlShape.isRequired,
      executeAction: PropTypes.func.isRequired,
    }).isRequired,
    route: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
    }).isRequired,
    trip: PropTypes.shape({
      gtfsId: PropTypes.string,
      pattern: PropTypes.shape({
        code: PropTypes.string.isRequired,
      }),
    }),
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
      this.props.route.gtfsId,
    );
  };

  render() {
    let patternPath = `/linjat/${this.props.route.gtfsId}/pysakit`;
    let tripPath = patternPath;

    if (this.props.trip) {
      patternPath += `/${this.props.trip.pattern.code}`;
      tripPath = `${patternPath}/${this.props.trip.gtfsId}`;
    }

    return (
      <div className="card">
        <RouteHeader
          route={this.props.route}
          pattern={this.props.trip && this.props.trip.pattern}
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
      .isFavourite(props.route.gtfsId),
  }),
);

export default createFragmentContainer(RouteMarkerPopupWithFavourite, {
  trip: graphql`
    fragment RouteMarkerPopup_trip on Trip {
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
    fragment RouteMarkerPopup_route on Route {
      gtfsId
      mode
      shortName
      longName
    }
  `,
});
