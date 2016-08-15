import React from 'react';
import Relay from 'react-relay';
import RouteHeader from './RouteHeader';
import without from 'lodash/without';
import { addFavouriteRoute } from '../../action/FavouriteActions';
import connectToStores from 'fluxible-addons-react/connectToStores';

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

  addAsFavouriteRoute= (e) => {
    e.stopPropagation();
    this.context.executeAction(
      addFavouriteRoute,
      this.props.pattern.route.gtfsId);
  }

  render = () => {
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
        addFavouriteRoute={this.addAsFavouriteRoute}
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
          mode
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
