import PropTypes from 'prop-types';
import cx from 'classnames';
import TimeSummary from './TimeSummary';
import StreetSummary from './StreetSummary';
import { itineraryShape } from '../../utils/shapes';

export default function ItinerarySummary({
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
      <TimeSummary
        duration={itinerary.duration}
        className="duration--itinerary-summary"
        startTime={itinerary.start}
        endTime={itinerary.end}
        futureText={futureText}
        multiRow={isMultiRow}
      />
      {walking.distance > 0 && (
        <StreetSummary
          className="distance--itinerary-summary"
          distance={walking.distance}
          duration={walking.duration}
          mode="walk"
        />
      )}
      {biking.distance > 0 && (
        <StreetSummary
          className="distance--itinerary-summary"
          icon="icon_cyclist"
          distance={biking.distance}
          duration={biking.duration}
          mode="bike"
        />
      )}
      {driving.distance > 0 && (
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

const summaryShape = PropTypes.shape({
  duration: PropTypes.number.isRequired,
  distance: PropTypes.number.isRequired,
});

ItinerarySummary.propTypes = {
  itinerary: itineraryShape.isRequired,
  walking: summaryShape.isRequired,
  biking: summaryShape.isRequired,
  driving: summaryShape.isRequired,
  futureText: PropTypes.string.isRequired,
  isMultiRow: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  hideBottomDivider: PropTypes.bool.isRequired,
};
