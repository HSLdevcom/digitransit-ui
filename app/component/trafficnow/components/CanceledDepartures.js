import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFragment } from 'react-relay';
import { DateTime } from 'luxon';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import CanceledDeparturesFragment from '../queries/CanceledDeparturesFragment';
import Icon from '../../Icon';
import EntityBadge from './EntityBadge';

const DEPARTURE_LIMIT = 10;

const CanceledDepartures = ({
  patterns: patternRefs,
  inline = false,
  departureLimit = DEPARTURE_LIMIT,
  mode,
}) => {
  const patterns = useFragment(CanceledDeparturesFragment, patternRefs);
  const { formatMessage } = useIntl();
  const [expandedDates, setExpandedDates] = useState([]);

  const patternsWithDeparturesByDate = patterns.map(pattern => ({
    ...pattern,
    canceledTripsByDate: Object.groupBy(
      pattern.canceledTrips,
      ({ serviceDate }) => serviceDate,
    ),
  }));

  return (
    <div className={cx('badges__departure-group', { inline })}>
      {patternsWithDeparturesByDate.map(pattern =>
        Object.entries(pattern.canceledTripsByDate).map(
          ([serviceDate, canceledTrips]) => (
            <div
              className={cx('badges__departure-group__date-group', {
                inline,
              })}
              key={`${pattern.code}-${serviceDate}`}
            >
              {serviceDate !== DateTime.now().toISODate() && (
                <div className="departures-date-badge">
                  <Icon img="icon_calendar" />
                  <div className="routes-s-bold">
                    {serviceDate ===
                    DateTime.now().plus({ days: 1 }).toISODate()
                      ? formatMessage({ id: 'tomorrow' })
                      : DateTime.fromISO(serviceDate).toFormat('d.L.')}
                  </div>
                </div>
              )}
              {patterns.length > 1 && (
                <EntityBadge entity={pattern} isPattern mode={mode} />
              )}
              <div className="departuretimes">
                {canceledTrips
                  .filter(
                    (_, i) =>
                      i < departureLimit || expandedDates.includes(serviceDate),
                  )
                  .map(({ trip }) => (
                    <span
                      key={`${trip.gtfsId}-${trip.stoptimes[0]}`}
                      className="badges__departure-time"
                    >
                      <span className="routes-m-narrow">
                        {DateTime.fromISO(serviceDate)
                          .plus(trip.stoptimes[0].scheduledDeparture * 1000)
                          .toFormat(' HH:mm ')}
                      </span>
                    </span>
                  ))}
              </div>
              {canceledTrips.length > departureLimit &&
                !expandedDates.includes(serviceDate) &&
                !inline && (
                  <button
                    className="show-departures-button"
                    onClick={() =>
                      setExpandedDates([...expandedDates, serviceDate])
                    }
                  >
                    {formatMessage({ id: 'show-all' })}
                  </button>
                )}
            </div>
          ),
        ),
      )}
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
  departureLimit: PropTypes.number,
  inline: PropTypes.bool,
  mode: PropTypes.string,
};

export default CanceledDepartures;
