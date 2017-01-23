import React from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import RouteHeader from './RouteHeader';
import { addFavouriteRoute } from '../action/FavouriteActions';

class RouteHeaderContainer extends React.Component {

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
  };

  static propTypes = {
    pattern: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    trip: React.PropTypes.string,
    favourite: React.PropTypes.bool,
  };

  addAsFavouriteRoute = (e) => {
    e.stopPropagation();
    this.context.executeAction(addFavouriteRoute, this.props.pattern.route.gtfsId);
  }

  render() {
    return (
      <RouteHeader
        className={this.props.className}
        key={this.props.pattern.code}
        route={this.props.pattern.route}
        pattern={this.props.pattern}
        trip={this.props.trip}
        favourite={this.props.favourite}
        addFavouriteRoute={this.addAsFavouriteRoute}
      />
    );
  }
}

const RouteHeaderContainerWithFavourite = connectToStores(
  RouteHeaderContainer, ['FavouriteRoutesStore'], (context, props) =>
    ({
      favourite: context.getStore('FavouriteRoutesStore').isFavourite(props.pattern.route.gtfsId),
    }),
);

export default Relay.createContainer(RouteHeaderContainerWithFavourite, {
  fragments: {
    pattern: () => Relay.QL`
      fragment on Pattern {
        code
        route {
          gtfsId
          mode
          shortName
        }
      }
    `,
  },
});
