import React from 'react';
import { useRouter } from 'found';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import { useConfigContext } from '../../configurations/ConfigContext';
import { PREFIX_TIMETABLE, TRAFFICNOW, routePagePath } from '../../util/path';
import Card from '../Card';
import Icon from '../Icon';
import CanceledDepartures from './components/CanceledDepartures';
import DisruptionStatus from './components/DisruptionStatus';
import RouteBadgeGroup from './components/RouteBadgeGroup';
import DisruptionBadge from './DisruptionBadge';

const CanceledTripCard = ({ mode, totalCount, trips, isMobile = false }) => {
  const { router } = useRouter();
  const { colors } = useConfigContext();

  const handleRouteBadgeClick = url => e => {
    e.preventDefault();
    e.stopPropagation();
    router.push(url);
  };

  /* eslint-disable no-param-reassign */
  const groupedTrips = trips.reduce((container, { start, trip }) => {
    if (!trip?.route?.gtfsId || !start?.schedule?.time?.departure) {
      return container;
    }

    const shortName = trip?.route?.shortName || 'unknown';
    if (container[shortName]) {
      container[shortName].trips.push({
        ...trip,
        departureTime: DateTime.fromISO(
          start?.schedule.time.departure,
        ).toFormat('HH:mm'),
      });
    } else {
      container[shortName] = {
        routeGtfsId: trip.route.gtfsId,
        trips: [
          {
            ...trip,
            departureTime: DateTime.fromISO(
              start?.schedule.time.departure,
            ).toFormat('HH:mm'),
          },
        ],
      };
    }
    return container;
  }, {});

  const isSingleRoute = Object.keys(groupedTrips).length === 1;

  return (
    <Card
      className="disruption-card clickable"
      onClick={handleRouteBadgeClick(`/${TRAFFICNOW}/peruutukset/${mode}`)}
    >
      <header>
        <span className="disruption-card__header-left">
          <DisruptionBadge showIcon variant="WARNING" label="NO_SERVICE" />
          {!isMobile && (
            <>
              {' '}
              <div className="separator vertical" />
              <DisruptionStatus
                active
                showDates={false}
                className="text-xs-bold"
              />
            </>
          )}
        </span>
        <button type="button">
          <Icon
            img="icon_arrow-collapse--right"
            color={colors.primary}
            className="disruption-card__icon"
          />
        </button>
      </header>
      <div className="badges">
        <RouteBadgeGroup
          mode={mode}
          stopPropagation
          routes={Object.entries(groupedTrips).map(
            ([shortName, { routeGtfsId, trips: groupedRouteTrips }]) => ({
              id: shortName,
              name: shortName,
              url: routePagePath(routeGtfsId, PREFIX_TIMETABLE),
              gtfsId: routeGtfsId,
              trips: groupedRouteTrips,
            }),
          )}
          renderRouteSuffix={({ trips: groupedRouteTrips }) =>
            isSingleRoute ? (
              <CanceledDepartures
                departures={groupedRouteTrips.map(
                  ({ tripId, departureTime }) => ({
                    tripId,
                    departureTime,
                  }),
                )}
              />
            ) : null
          }
          renderSuffix={
            totalCount > trips.length ? (
              <span style={{ backgroundColor: '#F2F5F7' }}>
                <Icon img="icon_three-dots" width={1.3} height={1.3} />
              </span>
            ) : null
          }
        />
      </div>
      {isMobile && (
        <DisruptionStatus active showDates={false} className="text-xs-bold" />
      )}
    </Card>
  );
};

CanceledTripCard.propTypes = {
  mode: PropTypes.string.isRequired,
  totalCount: PropTypes.number.isRequired,
  trips: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isMobile: PropTypes.bool,
};

export default CanceledTripCard;
