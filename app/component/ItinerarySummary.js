import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Duration from './Duration';
import Distance from './Distance';

function ItinerarySummary({
  itinerary,
  walking,
  biking,
  driving,
  futureText,
  isMultiRow,
  isMobile,
  hideBottomDivider,
}) {
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
      {walking?.distance > 0 && (
        <Distance
          className="distance--itinerary-summary"
          distance={walking.distance}
          duration={walking.duration}
          mode="walk"
        />
      )}
      {biking?.distance > 0 && (
        <Distance
          className="distance--itinerary-summary"
          icon="icon_cyclist"
          distance={biking.distance}
          duration={biking.duration}
          mode="bike"
        />
      )}
      {driving?.distance > 0 && (
        <Distance
          className="distance--itinerary-summary driving-summary"
          icon="icon_car-withoutBox"
          distance={driving.distance}
          duration={driving.duration}
          mode="car"
        />
      )}
      {!hideBottomDivider && <div className={cx('divider-bottom')} />}
    </div>
  );
}

ItinerarySummary.description = () =>
  "Displays itinerary summary; itinerary's duration and walk distance";

ItinerarySummary.propTypes = {
  itinerary: PropTypes.object.isRequired,
  walking: PropTypes.object,
  biking: PropTypes.object,
  driving: PropTypes.object,
  futureText: PropTypes.string,
  isMultiRow: PropTypes.bool,
  isMobile: PropTypes.bool,
  hideBottomDivider: PropTypes.bool,
};

ItinerarySummary.defaultProps = {
  walking: {},
  biking: {},
  driving: {},
  futureText: '',
  isMultiRow: false,
  isMobile: false,
  hideBottomDivider: false,
};

ItinerarySummary.displayName = 'ItinerarySummary';

export default ItinerarySummary;
