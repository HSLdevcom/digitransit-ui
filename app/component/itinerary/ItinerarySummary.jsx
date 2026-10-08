import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import TimeSummary from './TimeSummary';
import StreetSummary from './StreetSummary';
import { itineraryShape } from '../../../utils/client/shapes';

const EMPTY_SUMMARY = {};

function ItinerarySummary({
  itinerary,
  walking = EMPTY_SUMMARY,
  biking = EMPTY_SUMMARY,
  driving = EMPTY_SUMMARY,
  futureText = '',
  isMultiRow = false,
  isMobile = false,
  hideBottomDivider = false,
}) {
  return (
    <div className="itinerary-summary">
      {!isMobile && <div className="divider-top" />}
      <TimeSummary
        duration={itinerary.duration}
        className="duration--itinerary-summary"
        startTime={itinerary.start}
        endTime={itinerary.end}
        futureText={futureText}
        multiRow={isMultiRow}
      />
      {walking?.distance > 0 && (
        <StreetSummary
          className="distance--itinerary-summary"
          distance={walking.distance}
          duration={walking.duration}
          mode="walk"
        />
      )}
      {biking?.distance > 0 && (
        <StreetSummary
          className="distance--itinerary-summary"
          icon="icon_cyclist"
          distance={biking.distance}
          duration={biking.duration}
          mode="bike"
        />
      )}
      {driving?.distance > 0 && (
        <StreetSummary
          className="distance--itinerary-summary driving-summary"
          icon="icon_car"
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

const summaryShape = PropTypes.shape({
  duration: PropTypes.number,
  distance: PropTypes.number,
});

ItinerarySummary.propTypes = {
  itinerary: itineraryShape.isRequired,
  walking: summaryShape,
  biking: summaryShape,
  driving: summaryShape,
  futureText: PropTypes.string,
  isMultiRow: PropTypes.bool,
  isMobile: PropTypes.bool,
  hideBottomDivider: PropTypes.bool,
};

ItinerarySummary.displayName = 'ItinerarySummary';

export default ItinerarySummary;
