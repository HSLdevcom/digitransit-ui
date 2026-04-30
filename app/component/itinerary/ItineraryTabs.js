/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';
import ItineraryDetails from './ItineraryDetails';
import SwipeableTabs from '../SwipeableTabs';
import { planEdgeShape } from '../../util/shapes';

function ItineraryTabs({
  planEdges,
  tabIndex,
  isMobile,
  changeHash,
  recommendedIndex,
  feedback = {},
  giveFeedback,
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
          tabIndex={i}
          recommended={i === recommendedIndex}
          feedback={feedback[i]}
          giveFeedback={
            giveFeedback ? like => giveFeedback(i, like) : undefined
          }
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
      ariaRole="swipe-summary-page-tab"
    />
  );
}

ItineraryTabs.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  isMobile: PropTypes.bool.isRequired,
  planEdges: PropTypes.arrayOf(planEdgeShape).isRequired,
  changeHash: PropTypes.func,
  recommendedIndex: PropTypes.number,
  feedback: PropTypes.objectOf(PropTypes.bool),
  giveFeedback: PropTypes.func,
};

export default ItineraryTabs;
