import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import React, { useState, useEffect, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { matchShape } from 'found';
import { DateTime } from 'luxon';
import cx from 'classnames';
import { SchedulePatternFragment } from './queries/SchedulePatternFragment.js';
import { ScheduleRouteFragment } from './queries/ScheduleRouteFragment.js';
import { ScheduleFirstDeparturesFragment } from './queries/ScheduleFirstDeparturesFragment.js';
import ScheduleHeader from './ScheduleHeader.jsx';
import ScheduleTripList from './ScheduleTripList.jsx';
import ScheduleConstantOperation from './ScheduleConstantOperation.jsx';
import SecondaryButton from '../../SecondaryButton.jsx';
import { DATE_FORMAT } from '../../../constants.js';
import { addAnalyticsEvent } from '../../../util/analyticsUtils.js';
import { useBreakpoint } from '../../../util/withBreakpoint.jsx';
import DateSelectGrouped from '../../stop/DateSelectGrouped.jsx';
import RouteControlPanel from '../RouteControlPanel.jsx';
import ScrollableWrapper from '../../ScrollableWrapper.jsx';
import { useConfigContext } from '../../../configurations/ConfigContext.jsx';
import { getTripsList } from './scheduleTripsUtils.jsx';
import { routeShape, patternShape } from '../../../util/shapes.js';
import { calculateRedirectDecision } from './scheduleParamUtils.js';
import { buildAvailableDates } from './scheduleDataUtils.js';
import { splitGtfsId } from '../../../util/gtfs.js';

/**
 * Open a route timetable PDF in a new window.
 * @param {SyntheticEvent} e
 * @param {{ href: string }} routePDFUrl
 */
const openRoutePDF = (e, routePDFUrl) => {
  e.stopPropagation();
  window.open(routePDFUrl.href);
};

/**
 * Trigger browser print for the current timetable view.
 * @param {SyntheticEvent} e
 */
const printRouteTimetable = e => {
  e.stopPropagation();
  window.print();
  addAnalyticsEvent({
    category: 'Route',
    action: 'PrintTimetable',
    name: null,
  });
};

/**
 * ScheduleContainer is the main component for the route schedule page.
 * It handles data fetching and state management for the schedule,
 * and renders the header, trip list, date selector, and action buttons.
 */
const ScheduleContainer = ({
  pattern: patternRef,
  route: routeRef,
  firstDepartures: firstDeparturesRef,
  match,
}) => {
  const breakpoint = useBreakpoint();
  const pattern = useFragment(SchedulePatternFragment, patternRef);
  const route = useFragment(ScheduleRouteFragment, routeRef);
  const firstDepartures = useFragment(
    ScheduleFirstDeparturesFragment,
    firstDeparturesRef,
  );

  const intl = useIntl();
  const config = useConfigContext();

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(Math.max((pattern.stops.length || 1) - 1, 0));

  const { query } = match.location;
  const serviceDayString = query.serviceDay;
  const wantedDay = useMemo(
    () =>
      serviceDayString
        ? DateTime.fromFormat(serviceDayString, DATE_FORMAT)
        : DateTime.local(),
    [serviceDayString],
  );

  const availableDates = useMemo(
    () => buildAvailableDates(firstDepartures),
    [firstDepartures],
  );

  const patternCode = pattern.code;
  const patternWithTrips = route.patterns?.find(p => p.code === patternCode);

  const tripsResult = useMemo(
    () =>
      getTripsList({
        patternWithTrips,
        intl,
        wantedDay,
      }),
    [patternWithTrips, wantedDay],
  );

  const routeId = route.gtfsId;
  const { constantOperationRoutes } = config;
  const { locale } = intl;

  const constantOperationInfo =
    routeId && constantOperationRoutes?.[routeId]
      ? constantOperationRoutes[routeId][locale]
      : null;

  const redirectDecision = calculateRedirectDecision({
    wantedDay,
    patternCode,
    routeId,
    availableDates,
    hasTrips: !!tripsResult.trips,
  });

  const {
    shouldRedirect,
    redirectPath,
    query: redirectQuery,
  } = redirectDecision;

  useEffect(() => {
    if (shouldRedirect) {
      const basePath = redirectPath
        ? { ...match.location, pathname: redirectPath }
        : match.location;

      match.router.replace({
        ...basePath,
        query: { ...basePath.query, ...redirectQuery },
      });
    }
  }, [shouldRedirect, redirectPath, redirectQuery?.serviceDay, match.location]);

  useEffect(() => {
    if (patternCode) {
      setFrom(0);
      setTo(pattern.stops.length - 1);
    }
  }, [patternCode, pattern.stops.length]);

  // Handler for timetable origin stop selection
  const onFromSelectChange = selectFrom => {
    const fromValue = Number(selectFrom);
    setFrom(fromValue);
    setTo(prevTo => {
      if (prevTo > fromValue) {
        return prevTo;
      }
      return Math.min(fromValue + 1, pattern.stops.length - 1);
    });
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableStartPoint',
      name: null,
    });
  };

  // Handler for timetable destination stop selection
  const onToSelectChange = selectTo => {
    setTo(Number(selectTo));
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableEndPoint',
      name: null,
    });
  };

  const changeDate = newServiceDay => {
    const { location } = match;
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableDay',
      name: null,
    });
    const newPath = {
      ...location,
      query: {
        ...location.query,
        serviceDay: newServiceDay,
      },
    };
    match.router.replace(newPath);
  };

  const formattedServiceDate = wantedDay.toFormat(DATE_FORMAT);
  const { feedId: agencyId } = splitGtfsId(routeId);
  const hasRouteTimetableUrl = !!(
    agencyId &&
    formattedServiceDate &&
    config.timetables?.[agencyId] &&
    config.URL.ROUTE_TIMETABLES?.[agencyId]
  );

  const handlePrintPDF = e => {
    if (!hasRouteTimetableUrl) {
      return;
    }
    const routeTimetableHandler = config.timetables[agencyId];
    const baseUrl = config.URL.ROUTE_TIMETABLES[agencyId];
    const routeTimetableUrl = routeTimetableHandler.routeTimetableUrlResolver(
      baseUrl,
      route,
      formattedServiceDate,
      locale,
    );
    openRoutePDF(e, routeTimetableUrl);
    addAnalyticsEvent({
      category: 'Route',
      action: 'PrintWeeklyTimetable',
      name: null,
    });
  };

  if (constantOperationInfo) {
    return (
      <div
        id="route-timetable-panel"
        className="route-timetable-panel"
        role="tabpanel"
        aria-labelledby="route-timetable-tab"
      >
        <ScheduleConstantOperation
          constantOperationInfo={constantOperationInfo}
          match={match}
          route={route}
          breakpoint={breakpoint}
        />
      </div>
    );
  }

  const showTrips = tripsResult.trips;

  return (
    <div
      id="route-timetable-panel"
      className="route-timetable-panel"
      role="tabpanel"
      aria-labelledby="route-timetable-tab"
    >
      <ScrollableWrapper
        className={cx('route-schedule-container', {
          mobile: breakpoint !== 'large',
        })}
      >
        {route.patterns && (
          <RouteControlPanel
            match={match}
            route={route}
            breakpoint={breakpoint}
            noInitialServiceDay
          />
        )}
        <div className="route-schedule-grouped-date-select">
          <DateSelectGrouped
            dateFormat={DATE_FORMAT}
            selectedDay={wantedDay}
            dates={availableDates}
            onDateChange={changeDate}
          />
        </div>
        {!shouldRedirect && tripsResult.noTripsMessage}
        {pattern && (
          <div
            className={cx('route-schedule-list-wrapper', {
              'bp-large': breakpoint === 'large',
            })}
          >
            <ScheduleHeader
              stops={pattern.stops}
              from={from}
              to={to}
              onFromSelectChange={onFromSelectChange}
              onToSelectChange={onToSelectChange}
            />
            <div
              className="route-schedule-list momentum-scroll"
              role="list"
              aria-live="off"
            >
              {Array.isArray(showTrips) && (
                <ScheduleTripList trips={showTrips} fromIdx={from} toIdx={to} />
              )}
            </div>
          </div>
        )}
      </ScrollableWrapper>
      {breakpoint === 'large' && <div className="after-scrollable-area" />}
      <div className="route-page-action-bar">
        <div className="print-button-container">
          {hasRouteTimetableUrl && (
            <SecondaryButton
              ariaLabel="print-timetable"
              buttonName="print-timetable"
              buttonClickAction={handlePrintPDF}
              buttonIcon="icon_print"
              smallSize
            />
          )}
          <SecondaryButton
            ariaLabel="print"
            buttonName="print"
            buttonClickAction={printRouteTimetable}
            buttonIcon="icon_print"
            smallSize
          />
        </div>
      </div>
    </div>
  );
};

ScheduleContainer.propTypes = {
  pattern: patternShape.isRequired,
  route: routeShape.isRequired,
  // firstDepartures is a Relay fragment with dynamic structure
  // eslint-disable-next-line react/forbid-prop-types
  firstDepartures: PropTypes.object.isRequired,
  match: matchShape.isRequired,
};

ScheduleContainer.displayName = 'ScheduleContainer';

export { ScheduleContainer as Component };
export default ScheduleContainer;
