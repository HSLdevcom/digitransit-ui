import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Duration from './Duration';
import Distance from './Distance';
import { itineraryShape } from '../util/shapes';

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
  const { node } = itinerary;
  return (
    <div className="itinerary-summary">
      {!isMobile && <div className="divider-top" />}
      <Duration
        duration={node.duration}
        className="duration--itinerary-summary"
        startTime={node.startTime}
        endTime={node.endTime}
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
