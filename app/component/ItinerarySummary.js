import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Duration from './Duration';
import WalkDistance from './WalkDistance';

const ItinerarySummary = ({ itinerary, extraProps }) => {
  const { futureText, isMultiRow, isMobile, walking, biking } = extraProps;
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
      <div
        className={cx('divider-bottom', {
          multirow: isMultiRow,
        })}
      />
    </div>
  );
};

ItinerarySummary.description = () =>
  "Displays itinerary summary row; itinerary's duration and walk distance";

ItinerarySummary.propTypes = {
  itinerary: PropTypes.object.isRequired,
  extraProps: PropTypes.object.isRequired,
};

ItinerarySummary.displayName = 'ItinerarySummary';

export default ItinerarySummary;
