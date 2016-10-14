import React from 'react';
import Duration from './duration';
import WalkDistance from './walk-distance';

const ItinerarySummary = ({ itinerary, children }) => (
  <div className="itinerary-summary">
    <Duration duration={itinerary.duration} className="duration--itinerary-summary" />
    {children}
    <WalkDistance walkDistance={itinerary.walkDistance} />
  </div>);

ItinerarySummary.description =
  "Displays itinerary summary row; itinerary's duration and walk distance";

ItinerarySummary.propTypes = {
  itinerary: React.PropTypes.object.isRequired,
  children: React.PropTypes.node.isRequired,
};

ItinerarySummary.displayName = 'ItinerarySummary';

export default ItinerarySummary;
