import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import ItineraryDetails from './ItineraryDetails';
import SwipeableTabs from './SwipeableTabs';
import ItineraryShape from '../prop-types/ItineraryShape';

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

  const itineraryTabs = props.children.map((child, i) => {
    return (
      <div
        className={`swipeable-tab ${index !== i && 'inactive'}`}
        key={child.key}
      >
        <ItineraryDetails
          key={child.key}
          activeIndex={index + i}
          plan={props.plan}
          itinerary={child.props.itinerary}
          params={context.match.params}
          focusToPoint={props.focusToPoint}
          focusToLeg={props.focusToLeg}
          changeHash={props.changeHash}
          isMobile
          carItinerary={props.carItinerary}
        />
      </div>
    );
  });

  return (
    <SwipeableTabs
      tabs={itineraryTabs}
      tabIndex={index}
      onSwipe={props.onSwipe}
      classname="swipe-mobile-divider"
      ariaFrom="swipe-summary-page"
      ariaFromHeader="swipe-summary-page-header"
    />
  );
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
  onSwipe: PropTypes.func,
  carItinerary: ItineraryShape,
  changeHash: PropTypes.func,
};

MobileItineraryWrapper.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

export default MobileItineraryWrapper;
