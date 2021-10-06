import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import ItineraryTab from './ItineraryTab';
import SwipeableTabs from './SwipeableTabs';

const MobileItineraryWrapper = (props, context) => {
  const index = props.params.secondHash
    ? parseInt(props.params.secondHash, 10)
    : parseInt(props.params.hash, 10) || 0;

  if (!props.children) {
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
    context.match.location.state &&
    context.match.location.state.fullscreenMap === true;

  const itineraryTabs = props.children.map((child, i) => {
    return (
      <div
        className={`swipeable-tab ${index !== i && 'inactive'}`}
        key={child.key}
      >
        <ItineraryTab
          key={child.key}
          activeIndex={index + i}
          plan={props.plan}
          serviceTimeRange={props.serviceTimeRange}
          itinerary={child.props.itinerary}
          params={context.match.params}
          focusToPoint={props.focusToPoint}
          focusToLeg={props.focusToLeg}
          isMobile
          toggleCarpoolDrawer={props.toggleCarpoolDrawer}
        />
      </div>
    );
  });

  const itinerary = fullscreenMap ? undefined : (
    <SwipeableTabs
      tabs={itineraryTabs}
      tabIndex={index}
      onSwipe={props.onSwipe}
      classname="swipe-mobile-divider"
      ariaFrom="swipe-summary-page"
      ariaFromHeader="swipe-summary-page-header"
    />
  );
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return <>{itinerary}</>;
};

MobileItineraryWrapper.propTypes = {
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
  onSwipe: PropTypes.func,
  toggleCarpoolDrawer: PropTypes.func,
};

MobileItineraryWrapper.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

export default MobileItineraryWrapper;
