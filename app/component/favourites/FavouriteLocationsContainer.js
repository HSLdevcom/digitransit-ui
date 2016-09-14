import React, { PropTypes } from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import FavouriteLocationContainer from './FavouriteLocationContainer';
import FavouriteLocation from './FavouriteLocation';
import EmptyFavouriteLocationSlot from './EmptyFavouriteLocationSlot';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { setEndpoint } from '../../action/EndpointActions';

import config from '../../config';

class FavouriteLocationContainerRoute extends Relay.Route {
  static queries = {
    plan: (Component, variables) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('plan', {
          from: variables.from,
          to: variables.to,
          maxWalkDistance: variables.maxWalkDistance,
          wheelchair: variables.wheelchair,
          preferred: variables.preferred,
          arriveBy: variables.arriveBy,
          disableRemainingWeightHeuristic: variables.disableRemainingWeightHeuristic,
        })}
      }
    }`,
  };
  static paramDefinitions = {
    from: { required: true },
    to: { required: true },
  };
  static routeName = 'FavouriteLocationsContainerRoute';
}

class FavouriteLocationsContainer extends React.Component {

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
  };

  static description =
    <div>
      <p>Renders a container with favourite locations</p>
      <ComponentUsageExample description="">
        <FavouriteLocationsContainer />
      </ComponentUsageExample>
    </div>;

  static propTypes = {
    favourites: PropTypes.array.isRequired,
    currentTime: PropTypes.object.isRequired,
    location: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }),
  };

  setDestination = (locationName, lat, lon) => {
    const location = {
      lat,
      lon,
      address: locationName,
    };

    this.context.executeAction(setEndpoint, {
      target: 'destination',
      endpoint: location,
    });
  }

  getFavourite = (index) => {
    const favourite = this.props.favourites[index];

    if (typeof favourite === 'undefined') {
      return <EmptyFavouriteLocationSlot />;
    }

    const favouriteLocation = (<FavouriteLocation
      favourite={favourite} clickFavourite={this.setDestination}
    />);

    if (this.props.location) {
      return (<Relay.RootContainer
        Component={FavouriteLocationContainer} forceFetch
        route={new FavouriteLocationContainerRoute({
          from: {
            lat: this.props.location.lat,
            lon: this.props.location.lon,
          },

          to: {
            lat: favourite.lat,
            lon: favourite.lon,
          },

          maxWalkDistance: config.maxWalkDistance + 0.1,
          wheelchair: false,

          preferred: {
            agencies: config.preferredAgency || '',
          },

          arriveBy: false,
          disableRemainingWeightHeuristic: false,
        })} renderLoading={() => (favouriteLocation)
        } renderFetched={(data) => (
          <FavouriteLocationContainer
            favourite={favourite}
            onClickFavourite={this.setDestination}
            currentTime={this.props.currentTime.unix()}
            {...data}
          />)
        }
      />);
    }
    return favouriteLocation;
  }

  render() {
    return (<div>
      <div className="small-4 columns favourite-location-container--first">
        {this.getFavourite(0)}
      </div>
      <div className="small-4 columns favourite-location-container">{this.getFavourite(1)}</div>
      <div className="small-4 columns favourite-location-container--last">
        {this.getFavourite(2)}
      </div>
    </div>);
  }
}

export default connectToStores(FavouriteLocationsContainer,
  ['TimeStore', 'FavouriteLocationStore', 'EndpointStore'],
     (context) => {
       const position = context.getStore('PositionStore').getLocationState();
       const origin = context.getStore('EndpointStore').getOrigin();

       return {
         currentTime: context.getStore('TimeStore').getCurrentTime(),
         favourites: context.getStore('FavouriteLocationStore').getLocations(),

         location: (() => {
           if (origin.useCurrentPosition) {
             if (position.hasLocation) {
               return position;
             }
             return null;
           }

           return origin;
         })(),
       };
     });
