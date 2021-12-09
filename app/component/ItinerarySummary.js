import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Duration from './Duration';
import WalkDistance from './WalkDistance';

const ItinerarySummary = ({
  itinerary,
  walking,
  biking,
  futureText,
  isMultiRow,
  isMobile,
}) => {
  return (
    <div className="itinerary-summary">
      {!isMobile && <div className="divider-top" />}
      <Duration
        duration={itinerary.duration}
        className="duration--itinerary-summary"
        startTime={itinerary.startTime}
        endTime={itinerary.endTime}
        futureText={futureText}
        multiRow={isMultiRow}
      />
      {walking && walking.distance > 0 && (
        <WalkDistance
          className="distance--itinerary-summary"
          walkDistance={walking.distance}
          walkDuration={walking.duration}
        />
      )}
      {biking && biking.distance > 0 && (
        <WalkDistance
          className="distance--itinerary-summary"
          icon="icon_cyclist"
          walkDistance={biking.distance}
          walkDuration={biking.duration}
        />
      )}
      <div className={cx('divider-bottom')} />
    </div>
  );
};

ItinerarySummary.description = () =>
  "Displays itinerary summary row; itinerary's duration and walk distance";

ItinerarySummary.propTypes = {
  itinerary: PropTypes.object.isRequired,
  walking: PropTypes.object,
  biking: PropTypes.object,
  futureText: PropTypes.string,
  isMultiRow: PropTypes.bool,
  isMobile: PropTypes.bool,
};

ItinerarySummary.defaultTypes = {
  walking: {},
  biking: {},
  futureText: '',
  isMultiRow: false,
  isMobile: false,
};

ItinerarySummary.displayName = 'ItinerarySummary';

export default ItinerarySummary;
