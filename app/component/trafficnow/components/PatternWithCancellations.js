import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useConfigContext } from '../../../configurations/ConfigContext';
import Icon from '../../Icon';
import CancelledDepartures from './CancelledDepartures';

import './PatternWithCancellations.scss';

const PatternWithCancellations = ({
  pattern,
  withDepartureBadges = false,
  withDeparturesAmount = false,
}) => {
  const { colors } = useConfigContext();
  const { start, end, trip, cancelledDepartures } = pattern;

  return (
    <div
      className="pattern-column"
      style={{
        gap: withDepartureBadges ? 'var(--space-xs)' : 'var(--space-xxs)',
      }}
    >
      <div className="pattern-stops">
        <span>{start.stopLocation.name}</span>
        <Icon img="icon_arrow-right-long" color={colors.primary} />
        <span>{trip.pattern.headsign || end.stopLocation.name}</span>
      </div>
      {withDeparturesAmount && (
        <div className="routes-s warning">
          <FormattedMessage
            id="traffic-now_canceled-trips--simple"
            values={{ amount: cancelledDepartures.length }}
          />
        </div>
      )}
      {withDepartureBadges && (
        <CancelledDepartures
          departures={cancelledDepartures.map(departureTime => ({
            tripId: trip.tripId,
            departureTime,
          }))}
        />
      )}
    </div>
  );
};

PatternWithCancellations.propTypes = {
  pattern: PropTypes.shape({
    start: PropTypes.shape({
      stopLocation: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
    end: PropTypes.shape({
      stopLocation: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
    trip: PropTypes.shape({
      tripId: PropTypes.string,
      pattern: PropTypes.shape({
        headsign: PropTypes.string,
      }),
    }),
    cancelledDepartures: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  withDepartureBadges: PropTypes.bool,
  withDeparturesAmount: PropTypes.bool,
};

export default PatternWithCancellations;
