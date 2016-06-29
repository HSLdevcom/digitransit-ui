import React from 'react';
import Relay from 'react-relay';
import RouteHeader from './RouteHeader';
import without from 'lodash/without';
import FavouriteRoutesActions from '../../action/favourite-routes-action';
import connectToStores from 'fluxible-addons-react/connectToStores';

class RouteHeaderContainer extends React.Component {

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
  };

  static propTypes = {
    pattern: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    trip: React.PropTypes.object,
    favourite: React.PropTypes.bool,
  };

  constructor(args) {
    super(...args);
    this.addFavouriteRoute = this.addFavouriteRoute.bind(this);
    this.render = this.render.bind(this);
  }

  addFavouriteRoute(e) {
    e.stopPropagation();
    this.context.executeAction(
      FavouriteRoutesActions.addFavouriteRoute,
      this.props.pattern.route.gtfsId);
  }

  render() {
    let reverseId;

    const patterns = this.props.pattern.route.patterns.map(pattern => pattern.code);

    const reverseIds = without(patterns, this.props.pattern.code);
    if (reverseIds.length >= 1) {
      reverseId = reverseIds[0];
    }

    return (
      <RouteHeader
        className={this.props.className}
        key={this.props.pattern.code}
        route={this.props.pattern.route}
        pattern={this.props.pattern}
        trip={this.props.trip}
        reverseId={reverseId}
        favourite={this.props.favourite}
        addFavouriteRoute={this.addFavouriteRoute}
      />);
  }
}

const RouteHeaderContainerWithFavourite = connectToStores(
  RouteHeaderContainer, ['FavouriteRoutesStore'], (context, props) =>
    ({
      favourite: context.getStore('FavouriteRoutesStore').isFavourite(props.pattern.route.gtfsId),
    })
);

export default Relay.createContainer(RouteHeaderContainerWithFavourite, {
  fragments: {
    pattern: () => Relay.QL`
      fragment on Pattern {
        code
        headsign
        route {
          gtfsId
          type
          shortName
          longName
          patterns {
            code
          }
        }
        stops {
          name
        }
      }
    `,
  },
});
