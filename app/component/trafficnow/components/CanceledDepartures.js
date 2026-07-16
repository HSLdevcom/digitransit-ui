import React from 'react';
import PropTypes from 'prop-types';
import { useFragment } from 'react-relay';
import CanceledDeparturesFragment from '../queries/CanceledDeparturesFragment';
import { getStartTimeWithColon } from '../../../util/timeUtils';

const CanceledDepartures = ({ patterns: patternRefs }) => {
  const patterns = useFragment(CanceledDeparturesFragment, patternRefs);
  const departures = patterns.flatMap(
    pattern =>
      pattern.canceledTrips.map(({ trip }) => ({
        tripId: trip.gtfsId,
        departureTime: getStartTimeWithColon(
          trip.stoptimes[0].scheduledDeparture,
        ),
      })) || [],
  );

  return (
    <div className="badges__departure-group">
      {departures.map(({ tripId, departureTime }) => (
        <span
          key={`${tripId}-${departureTime}`}
          className="badges__departure-time"
        >
          <span className="routes-s-narrow">{departureTime}</span>
        </span>
      ))}
    </div>
  );
};

CanceledDepartures.propTypes = {
  patterns: PropTypes.arrayOf(
    PropTypes.shape({
      canceledTrips: PropTypes.arrayOf(
        PropTypes.shape({
          trip: PropTypes.shape({
            gtfsId: PropTypes.string.isRequired,
            stoptimes: PropTypes.arrayOf(
              PropTypes.shape({
                scheduledDeparture: PropTypes.number.isRequired,
              }).isRequired,
            ).isRequired,
          }).isRequired,
        }).isRequired,
      ),
    }).isRequired,
  ).isRequired,
};

export default CanceledDepartures;
