import PropTypes from 'prop-types';
import React from 'react';
import { useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import { DateTime } from 'luxon';
import DisruptionList from '../DisruptionList';
import { getAlertsForObject, setEntityForAlert } from '../../util/alertUtils';
import { getStartTimeWithColon } from '../../util/timeUtils';
import { AlertSeverityLevelType, AlertEntityType } from '../../constants';
import { patternTextWithIcon } from './RoutePatternSelect';
import { RouteAlertsContainerFragment } from './queries/RouteAlertsContainerFragment';

const getCancelations = (route, pattern, entity, intl) => {
  if (!pattern.canceledTrips) {
    return null;
  }

  const canceledTripsByDate = Object.groupBy(
    pattern.canceledTrips,
    ({ serviceDate }) => serviceDate,
  );

  return Object.entries(canceledTripsByDate).map(([date, canceledTrips]) => ({
    alertDescriptionText: intl.formatMessage(
      { id: 'generic-cancelation' },
      {
        mode: route.mode,
        route: route.shortName,
        headsign: canceledTrips[0].trip.tripHeadsign,
        times: canceledTrips
          .map(st =>
            getStartTimeWithColon(st.trip.stoptimes[0].scheduledDeparture),
          )
          .join(', '),
      },
    ),
    id: pattern.code + date,
    alertHeaderText: patternTextWithIcon(pattern),
    canceledDepartures: canceledTrips.map(({ trip }) => ({
      scheduledDeparture: trip.stoptimes[0].scheduledDeparture,
    })),
    entities: [entity],
    alertSeverityLevel: AlertSeverityLevelType.Warning,
    effectiveStartDate: DateTime.fromISO(date).toSeconds(),
    effectiveEndDate: DateTime.fromISO(date).plus({ days: 1 }).toSeconds(),
  }));
};

function RouteAlertsContainer({ route: routeRef, pattern: patternRef }) {
  const intl = useIntl();

  const route = useFragment(RouteAlertsContainerFragment.route, routeRef);
  const pattern = useFragment(RouteAlertsContainerFragment.pattern, patternRef);

  if (!route) {
    return null;
  }
  const entity = {
    __typename: AlertEntityType.Route,
    color: route.color,
    type: route.type,
    mode: route.mode,
    shortName: route.shortName,
    gtfsId: route.gtfsId,
    code: pattern.code,
  };
  const cancelations = getCancelations(route, pattern, entity, intl);

  const serviceAlerts = getAlertsForObject(pattern).map(alert =>
    // We display all alerts as they would be for the route in this view
    setEntityForAlert(alert, entity),
  );

  return (
    <div
      id="route-disruption-panel"
      className="route-disruption-panel"
      role="tabpanel"
      aria-labelledby="route-disruption-tab"
    >
      <DisruptionList
        cancelations={cancelations}
        serviceAlerts={serviceAlerts}
      />
    </div>
  );
}

RouteAlertsContainer.propTypes = {
  route: PropTypes.shape({}).isRequired,
  pattern: PropTypes.shape({}).isRequired,
};

export default RouteAlertsContainer;
