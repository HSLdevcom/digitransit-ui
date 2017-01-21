import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';

import RouteHeader from '../../RouteHeader';
import Icon from '../../Icon';

import { addFavouriteRoute } from '../../../action/FavouriteActions';


class RouteMarkerPopup extends React.Component {
  static childContextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    context: React.PropTypes.shape({
      router: React.PropTypes.object.isRequired,
      executeAction: React.PropTypes.func.isRequired,
    }).isRequired,
    trip: React.PropTypes.shape({
      route: React.PropTypes.shape({
        gtfsId: React.PropTypes.string.isRequired,
      }).isRequired,
      fuzzyTrip: React.PropTypes.shape({
        gtfsId: React.PropTypes.string,
        pattern: React.PropTypes.shape({
          code: React.PropTypes.string.isRequired,
        }),
      }),
    }).isRequired,
    favourite: React.PropTypes.bool,
    message: React.PropTypes.shape({
      mode: React.PropTypes.string.isRequired,
      tripStartTime: React.PropTypes.string.isRequired,
    }).isRequired,
  }


  getChildContext() {
    return {
      router: this.props.context.router,
    };
  }

  addAsFavouriteRoute = (e) => {
    e.stopPropagation();
    this.props.context.executeAction(addFavouriteRoute, this.props.trip.route.gtfsId);
  }

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
          pattern={this.props.trip.fuzzyTrip && this.props.trip.fuzzyTrip.pattern}
          trip={this.props.message.tripStartTime}
          favourite={this.props.favourite}
          addFavouriteRoute={this.addAsFavouriteRoute}
        />
        <div className="bottom location">
          <Link to={tripPath} >
            <Icon img="icon-icon_time" />
            Lähdön tiedot
          </Link>
          <br />
          <Link to={patternPath} className="route" >
            <Icon img={`icon-icon_${this.props.message.mode}-withoutBox`} />
            Linjan tiedot
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
    favourite: context.getStore('FavouriteRoutesStore').isFavourite(props.trip.route.gtfsId),
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
