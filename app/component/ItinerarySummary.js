import PropTypes from 'prop-types';
import React from 'react';
import Duration from './Duration';
import WalkDistance from './WalkDistance';
import {
  getTotalWalkingDistance,
  getTotalBikingDistance,
  containsBiking,
  onlyBiking,
  compressLegs,
  getTotalBikingDuration,
  getTotalWalkingDuration,
} from '../util/legUtils';

const ItinerarySummary = ({ itinerary }) => {
  const compressedLegs = compressLegs(itinerary.legs);
  const compressedItinerary = {
    ...itinerary,
    legs: compressedLegs,
  };
  return (
    <div className="itinerary-summary">
      <Duration
        duration={compressedItinerary.duration}
        className="duration--itinerary-summary"
        startTime={compressedItinerary.startTime}
        endTime={compressedItinerary.endTime}
      />
      {!onlyBiking(compressedItinerary) &&
        getTotalWalkingDistance(compressedItinerary) > 0 && (
          <WalkDistance
            className="distance--itinerary-summary"
            walkDistance={getTotalWalkingDistance(compressedItinerary)}
            walkDuration={getTotalWalkingDuration(compressedItinerary)}
          />
        )}
      {containsBiking(compressedItinerary) && (
        <WalkDistance
          className="distance--itinerary-summary"
          icon="icon_cyclist"
          walkDistance={getTotalBikingDistance(compressedItinerary)}
          walkDuration={getTotalBikingDuration(compressedItinerary)}
        />
      )}
    </div>
  );
};

ItinerarySummary.description = () =>
  "Displays itinerary summary row; itinerary's duration and walk distance";

ItinerarySummary.propTypes = {
  itinerary: PropTypes.object.isRequired,
};

ItinerarySummary.displayName = 'ItinerarySummary';

export default ItinerarySummary;
