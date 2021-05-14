import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import ItineraryTab from './ItineraryTab';
import SwipeableTabs from './SwipeableTabs';
import { addAnalyticsEvent } from '../util/analyticsUtils';

export default class MobileItineraryWrapper extends React.Component {
  static propTypes = {
    focusToPoint: PropTypes.func.isRequired,
    focusToLeg: PropTypes.func,
    children: PropTypes.arrayOf(PropTypes.node.isRequired).isRequired,
    params: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      hash: PropTypes.string.isRequired,
      secondHash: PropTypes.string,
    }).isRequired,
    plan: PropTypes.object,
    serviceTimeRange: PropTypes.object.isRequired,
    toggleCarpoolDrawer: PropTypes.func,
    onSwipe: PropTypes.func,
  };

  static contextTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
  };

  toggleFullscreenMap = () => {
    const fullscreenMap =
      this.context.match.location.state &&
      this.context.match.location.state.fullscreenMap === true;
    if (fullscreenMap) {
      this.context.router.go(-1);
    } else {
      this.context.router.push({
        ...this.context.match.location,
        state: { ...this.context.match.location.state, fullscreenMap: true },
      });
    }
    addAnalyticsEvent({
      action: fullscreenMap ? 'MinimizeMapOnMobile' : 'MaximizeMapOnMobile',
      category: 'Map',
      name: 'SummaryPage',
    });
  };

  render() {
    const index = this.props.params.secondHash
      ? parseInt(this.props.params.secondHash, 10)
      : parseInt(this.props.params.hash, 10) || 0;

    if (!this.props.children) {
      return (
        <div className="itinerary-no-route-found">
          <FormattedMessage
            id="no-route-msg"
            defaultMessage="
              Unfortunately no route was found between the locations you gave.
              Please change origin and/or destination address.
            "
          />
        </div>
      );
    }

    const fullscreenMap =
      this.context.match.location.state &&
      this.context.match.location.state.fullscreenMap === true;

    const itineraryTabs = this.props.children.map((child, i) => {
      return (
        <div
          className={`swipeable-tab ${index !== i && 'inactive'}`}
          key={child.key}
        >
          <ItineraryTab
            key={child.key}
            activeIndex={index + i}
            plan={this.props.plan}
            serviceTimeRange={this.props.serviceTimeRange}
            itinerary={child.props.itinerary}
            params={this.context.match.params}
            focusToPoint={this.props.focusToPoint}
            focusToLeg={this.props.focusToLeg}
            isMobile
            toggleCarpoolDrawer={this.props.toggleCarpoolDrawer}
          />
        </div>
      );
    });

    const itinerary = fullscreenMap ? undefined : (
      <SwipeableTabs
        tabs={itineraryTabs}
        tabIndex={index}
        onSwipe={this.props.onSwipe}
        classname="swipe-mobile-divider"
        ariaFrom="swipe-summary-page"
        ariaFromHeader="swipe-summary-page-header"
      />
    );
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    return <>{itinerary}</>;
  }
}
