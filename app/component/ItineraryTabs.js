import PropTypes from 'prop-types';
import React from 'react';
import ItineraryDetails from './ItineraryDetails';
import SwipeableTabs from './SwipeableTabs';
import { itineraryShape } from '../util/shapes';

/* eslint-disable react/no-array-index-key */
function ItineraryTabs(props) {
  const { itineraries, toggleSettings } = props;

  const itineraryTabs = itineraries.map((itinerary, i) => {
    return (
      <div
        className={`swipeable-tab ${props.tabIndex !== i && 'inactive'}`}
        key={`itinerary-${i}`}
        aria-hidden={props.tabIndex !== i}
      >
        <ItineraryDetails
          {...props}
          itinerary={itinerary}
          hideTitle={!props.isMobile}
          changeHash={props.isMobile ? props.changeHash : undefined}
          toggleSettings={toggleSettings}
        />
      </div>
    );
  });

  return (
    <SwipeableTabs
      tabs={itineraryTabs}
      tabIndex={props.tabIndex}
      onSwipe={props.changeHash}
      classname={props.isMobile ? 'swipe-mobile-divider' : 'swipe-desktop-view'}
      ariaFrom="swipe-summary-page"
      ariaFromHeader="swipe-summary-page-header"
    />
  );
}

ItineraryTabs.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  isMobile: PropTypes.bool.isRequired,
  focusToPoint: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  itineraries: PropTypes.arrayOf(itineraryShape).isRequired,
  carItinerary: itineraryShape,
  changeHash: PropTypes.func,
  toggleSettings: PropTypes.func.isRequired,
};

ItineraryTabs.defaultProps = {
  changeHash: undefined,
  carItinerary: undefined,
};

export default ItineraryTabs;
