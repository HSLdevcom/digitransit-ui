import React, { PropTypes } from 'react';
import Relay from 'react-relay';
import { routerShape, locationShape, Link } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import range from 'lodash/range';

import Icon from './Icon';
import FavouriteLocationContainer from './FavouriteLocationContainer';
import FavouriteLocation from './FavouriteLocation';
import EmptyFavouriteLocationSlot from './EmptyFavouriteLocationSlot';
import ComponentUsageExample from './ComponentUsageExample';
import { setEndpoint } from '../action/EndpointActions';
import NoFavouriteLocations from './NoFavouriteLocations';
import { isMobile } from '../util/browser';

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

const SwipeableViewsKB = bindKeyboard(SwipeableViews);

class FavouriteLocationsContainer extends React.Component {

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    config: React.PropTypes.object.isRequired,
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

  static SLOTS_PER_CLICK = 3;

  constructor() {
    super();
    this.state = { slideIndex: 0 };
  }

  onChangeIndex = (index) => {
    if (index > this.props.favourites.length - 2) {
      this.setState({ slideIndex: index }, () => {
        const newSlideIndex = Math.max(0, this.props.favourites.length - 2);
        this.setState({ slideIndex: newSlideIndex });
      });
    } else {
      this.setState({ slideIndex: index });
    }
  }

  onPrev = () => {
    const newSlideIndex = Math.max(0, this.state.slideIndex -
      FavouriteLocationsContainer.SLOTS_PER_CLICK);
    this.setState({ slideIndex: newSlideIndex });
  }

  onNext = () => {
    const newSlideIndex = Math.min(this.state.slideIndex +
      FavouriteLocationsContainer.SLOTS_PER_CLICK, this.props.favourites.length - 2);
    this.setState({ slideIndex: newSlideIndex });
  }

  setDestination = (locationName, lat, lon) => {
    const location = {
      lat,
      lon,
      address: locationName,
    };

    this.context.executeAction(setEndpoint, {
      target: 'destination',
      endpoint: location,
      router: this.context.router,
      location: this.context.location,
    });
  }

  slideRenderer = ({ key, index }) => {
    // 'add-new' slot at the end
    if (index === this.props.favourites.length) {
      return <EmptyFavouriteLocationSlot key={key} index={index} />;
    }

    const favourite = this.props.favourites[index];

    const favouriteLocation = (<FavouriteLocation
      key={key}
      favourite={favourite} clickFavourite={this.setDestination}
    />);

    if (this.props.location) {
      const config = this.context.config;

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
        } renderFetched={data => (
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
    if (this.props.favourites.length === 0) {
      return (<NoFavouriteLocations />);
    }
    const styles = {
      root: {
        padding: '0px 0.1em',
        overflowX: 'visible',
        width: '100%',
        marginLeft: '10%',
      },
      slideContainer: {
        padding: '0px',
        margin: '0px',
        width: '100%',
      },
    };

    let displayLeft = this.state.slideIndex > 0;
    let displayRight = this.state.slideIndex < (this.props.favourites.length
      - FavouriteLocationsContainer.SLOTS_PER_CLICK) + 1;

    const fadeClass = ((((displayLeft && displayRight) && 'double-overflow-fade') ||
     (displayLeft && 'overflow-fade-left')) || (displayRight && 'overflow-fade')) || '';

    displayLeft = !isMobile && displayLeft;
    displayRight = !isMobile && displayRight;

    return (
      <div style={{ position: 'relative' }}>
        <div className={`favourite-locations-container ${fadeClass} border-bottom`}>
          <div key={`fav-locations-${this.props.favourites.length}`} style={{ padding: '1em 0px', width: '32%' }} >
            <SwipeableViewsKB
              style={styles.root} slideStyle={styles.slideContainer}
              index={this.state.slideIndex}
              onChangeIndex={this.onChangeIndex}
            >
              {range(this.props.favourites.length + 1).map(v => (
                  this.slideRenderer({ key: v, index: v })),
                )}
            </SwipeableViewsKB>
          </div>
        </div>
        {displayLeft && <Link className="fav-location-nav-button-container-left" onClick={this.onPrev}>
          <span className="fav-location-nav-button">
            <Icon img="icon-icon_arrow-collapse--left" />
          </span>
        </Link>}
        {displayRight && <Link className="fav-location-nav-button-container-right" onClick={this.onNext}>
          <span className="fav-location-nav-button">
            <Icon img="icon-icon_arrow-collapse--right" />
          </span>
        </Link>
      }
      </div>
    );
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
