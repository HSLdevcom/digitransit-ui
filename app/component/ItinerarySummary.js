import PropTypes from 'prop-types';
import React from 'react';
import Duration from './Duration';
import WalkDistance from './WalkDistance';
import {
  getTotalWalkingDistance,
  getTotalBikingDistance,
  containsBiking,
  onlyBiking,
} from '../util/legUtils';

const ItinerarySummary = ({ itinerary }) => (
  <div className="itinerary-summary">
    <Duration
      duration={itinerary.duration}
      className="duration--itinerary-summary"
    />
    {containsBiking(itinerary) && (
      <WalkDistance
        className="biking-distance--itinerary-summary"
        icon="icon_biking"
        walkDistance={getTotalBikingDistance(itinerary)}
      />
    )}
    {!onlyBiking(itinerary) && (
      <WalkDistance walkDistance={getTotalWalkingDistance(itinerary)} />
    )}
  </div>
);

ItinerarySummary.description = () =>
  "Displays itinerary summary row; itinerary's duration and walk distance";

ItinerarySummary.propTypes = {
  itinerary: PropTypes.object.isRequired,
};

ItinerarySummary.displayName = 'ItinerarySummary';

export default ItinerarySummary;
