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
      />
      {containsBiking(compressedItinerary) && (
        <WalkDistance
          className="biking-distance--itinerary-summary"
          icon="icon_biking"
          walkDistance={getTotalBikingDistance(compressedItinerary)}
        />
      )}
      {!onlyBiking(compressedItinerary) && (
        <WalkDistance
          walkDistance={getTotalWalkingDistance(compressedItinerary)}
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
