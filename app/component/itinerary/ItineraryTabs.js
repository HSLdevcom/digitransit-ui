import PropTypes from 'prop-types';
import React from 'react';
import ItineraryDetails from './ItineraryDetails';

import SwipeableTabs from '../SwipeableTabs';
import { planEdgeShape } from '../../util/shapes';

/* eslint-disable react/no-array-index-key */

function ItineraryTabs({
  planEdges,
  tabIndex,
  isMobile,
  changeHash,
  toggleSettings,
  ...rest
}) {
  const itineraryTabs = planEdges.map((edge, i) => {
    return (
      <div
        className={`swipeable-tab ${tabIndex !== i && 'inactive'}`}
        key={`itinerary-${i}`}
        aria-hidden={tabIndex !== i}
      >
        <ItineraryDetails
          itinerary={edge.node}
          hideTitle={!isMobile}
          changeHash={isMobile ? changeHash : undefined}
          isMobile={isMobile}
          toggleSettings={toggleSettings}
          {...rest}
        />
      </div>
    );
  });

  return (
    <SwipeableTabs
      tabs={itineraryTabs}
      tabIndex={tabIndex}
      onSwipe={changeHash}
      classname={isMobile ? 'swipe-mobile-divider' : 'swipe-desktop-view'}
      ariaFrom="swipe-summary-page"
      ariaFromHeader="swipe-summary-page-header"
    />
  );
}

ItineraryTabs.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  isMobile: PropTypes.bool.isRequired,
  planEdges: PropTypes.arrayOf(planEdgeShape).isRequired,
  changeHash: PropTypes.func,
  toggleSettings: PropTypes.func.isRequired,
};

ItineraryTabs.defaultProps = {
  changeHash: undefined,
};

export default ItineraryTabs;
