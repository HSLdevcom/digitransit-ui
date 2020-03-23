import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'found';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import range from 'lodash/range';
import { navigateTo } from '../util/path';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { dtLocationShape } from '../util/shapes';
import { isMobile } from '../util/browser';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import FavouriteLocation from './FavouriteLocation';
import EmptyFavouriteLocationSlot from './EmptyFavouriteLocationSlot';

const SwipeableViewsKB = bindKeyboard(SwipeableViews);

export default class FavouriteLocationsContainer extends React.Component {
  static contextTypes = {
    router: routerShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static description = (
    <div>
      <p>Renders a container with favourite locations</p>
      <ComponentUsageExample description="">
        <FavouriteLocationsContainer />
      </ComponentUsageExample>
    </div>
  );

  static propTypes = {
    favourites: PropTypes.array.isRequired,
    currentTime: PropTypes.number,
    origin: dtLocationShape,
  };

  static SLOTS_PER_CLICK = 3;

  constructor() {
    super();
    this.state = { slideIndex: 0 };
  }

  onChangeIndex = index => {
    if (index > this.props.favourites.length - 2) {
      this.setState({ slideIndex: index }, () => {
        const newSlideIndex = Math.max(0, this.props.favourites.length - 2);
        this.setState({ slideIndex: newSlideIndex });
      });
    } else {
      this.setState({ slideIndex: index });
    }
  };

  onPrev = () => {
    this.setState(prevState => {
      const newSlideIndex = Math.max(
        0,
        prevState.slideIndex - FavouriteLocationsContainer.SLOTS_PER_CLICK,
      );
      return { slideIndex: newSlideIndex };
    });
  };

  onNext = () => {
    this.setState(prevState => {
      const newSlideIndex = Math.min(
        prevState.slideIndex + FavouriteLocationsContainer.SLOTS_PER_CLICK,
        this.props.favourites.length - 2,
      );
      return { slideIndex: newSlideIndex };
    });
  };

  setDestination = (name, lat, lon) => {
    const location = {
      lat,
      lon,
      address: name,
      ready: true,
    };

    addAnalyticsEvent({
      action: 'EditJourneyEndPoint',
      category: 'ItinerarySettings',
      name: 'FavouritePanel',
    });

    navigateTo({
      origin: this.props.origin,
      destination: location,
      context: '/',
      router: this.context.router,
    });
  };

  slideRenderer = ({ key, index }) => {
    // 'add-new' slot at the end
    if (index === this.props.favourites.length) {
      return <EmptyFavouriteLocationSlot key={key} index={index} />;
    }

    const favourite = this.props.favourites[index];

    return (
      <FavouriteLocation
        key={`favourite-${key}`}
        favourite={favourite}
        onClickFavourite={this.setDestination}
        currentTime={this.props.currentTime}
      />
    );
  };

  render() {
    if (this.props.favourites.length === 0) {
      return (
        <div id="no-favourites-container">
          <EmptyFavouriteLocationSlot index={0} />
        </div>
      );
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
    let displayRight =
      this.state.slideIndex <
      this.props.favourites.length -
        FavouriteLocationsContainer.SLOTS_PER_CLICK +
        1;

    const fadeClass =
      (displayLeft && displayRight && 'double-overflow-fade') ||
      (displayLeft && 'overflow-fade-left') ||
      (displayRight && 'overflow-fade') ||
      '';

    displayLeft = !isMobile && displayLeft;
    displayRight = !isMobile && displayRight;

    /* eslint-disable anchor-is-valid click-events-have-key-events no-static-element-interactions */
    return (
      <div style={{ position: 'relative' }}>
        <div className={`${fadeClass}`}>
          <div
            key={`fav-locations-${this.props.favourites.length}`}
            style={{ padding: '1em 0px', width: '32%' }}
          >
            <SwipeableViewsKB
              style={styles.root}
              slideStyle={styles.slideContainer}
              index={this.state.slideIndex}
              onChangeIndex={this.onChangeIndex}
            >
              {range(this.props.favourites.length + 1).map(v =>
                this.slideRenderer({ key: v, index: v }),
              )}
            </SwipeableViewsKB>
          </div>
        </div>
        {displayLeft && (
          <button
            className="fav-location-nav-button-container-left noborder"
            onClick={this.onPrev}
          >
            <span className="fav-location-nav-button">
              <Icon img="icon-icon_arrow-collapse--left" />
            </span>
          </button>
        )}
        {displayRight && (
          <button
            className="fav-location-nav-button-container-right noborder"
            onClick={this.onNext}
          >
            <span className="fav-location-nav-button">
              <Icon img="icon-icon_arrow-collapse--right" />
            </span>
          </button>
        )}
      </div>
    );
  }
}
