import PropTypes from 'prop-types';
import React, { useState, useEffect, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { matchShape } from 'found';
import { DateTime } from 'luxon';
import cx from 'classnames';
import { SchedulePatternFragment } from './queries/SchedulePatternFragment';
import { ScheduleRouteFragment } from './queries/ScheduleRouteFragment';
import { ScheduleFirstDeparturesFragment } from './queries/ScheduleFirstDeparturesFragment';
import ScheduleHeader from './ScheduleHeader';
import ScheduleTripList from './ScheduleTripList';
import ScheduleConstantOperation from './ScheduleConstantOperation';
import SecondaryButton from '../../SecondaryButton';
import { DATE_FORMAT } from '../../../constants';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { useBreakpoint } from '../../../util/withBreakpoint';
import DateSelectGrouped from '../../stop/DateSelectGrouped';
import RouteControlPanel from '../RouteControlPanel';
import ScrollableWrapper from '../../ScrollableWrapper';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import { getTripsList } from './scheduleTripsUtils';
import { routeShape, patternShape } from '../../../util/shapes';
import { calculateRedirectDecision } from './scheduleParamUtils';
import { buildAvailableDates } from './scheduleDataUtils';

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

  const intl = useTranslationsContext();
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

  useEffect(() => {
    const redirectDecision = calculateRedirectDecision({
      wantedDay,
      patternCode,
      routeId,
    });
    if (redirectDecision.shouldRedirect) {
      const basePath = redirectDecision.redirectPath
        ? { ...match.location, pathname: redirectDecision.redirectPath }
        : match.location;

      match.router.replace({
        ...basePath,
        query: { ...basePath.query, ...redirectDecision.query },
      });
    }
  }, [wantedDay, patternCode, routeId, match.location]);

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
  const agencyId = routeId?.split(':')?.[0];
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
      <ScheduleConstantOperation
        constantOperationInfo={constantOperationInfo}
        match={match}
        route={route}
        breakpoint={breakpoint}
      />
    );
  }

  const showTrips = tripsResult.trips;

  return (
    <>
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
        {tripsResult.noTripsMessage}
        {pattern && (
          <div
            className={cx('route-schedule-list-wrapper', {
              'bp-large': breakpoint === 'large',
            })}
            aria-live="polite"
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
    </>
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
