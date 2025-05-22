import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import padStart from 'lodash/padStart';
import { FormattedMessage, intlShape } from 'react-intl';
import { matchShape, routerShape, RedirectException } from 'found';
import { useFragment } from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import cx from 'classnames';
import { configShape } from '../../util/shapes';
import Icon from '../Icon';
import FilterTimeTableModal from './FilterTimeTableModal';
import TimeTableOptionsPanel from './TimeTableOptionsPanel';
import TimetableRow from './TimetableRow';
import { RealtimeStateType } from '../../constants';
import SecondaryButton from '../SecondaryButton';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import DateSelect from './DateSelect';
import ScrollableWrapper from '../ScrollableWrapper';
import { replaceQueryParams } from '../../util/queryUtils';
import { isBrowser } from '../../util/browser';
import { PREFIX_STOPS } from '../../util/path';
import { TimetableFragment } from './queries/TimetableFragment';

const mapStopTimes = stoptimesObject =>
  stoptimesObject
    .map(stoptime =>
      stoptime.stoptimes
        .filter(st => st.pickupType !== 'NONE')
        .map(st => ({
          id: stoptime.pattern.code,
          name: stoptime.pattern.route.shortName || stoptime.pattern.headsign,
          scheduledDeparture: st.scheduledDeparture,
          serviceDay: st.serviceDay,
          headsign: stoptime.pattern.headsign,
          longName: stoptime.pattern.route.longName,
          isCanceled: st.realtimeState === RealtimeStateType.Canceled,
          mode: stoptime.pattern.route.mode,
        })),
    )
    .reduce((acc, val) => acc.concat(val), []);

const groupArrayByHour = stoptimesArray =>
  groupBy(stoptimesArray, stoptime =>
    Math.floor(stoptime.scheduledDeparture / (60 * 60)),
  );

const printStop = e => {
  e.stopPropagation();
  window.print();
};

const printStopPDF = (e, stopPDFURL) => {
  e.stopPropagation();
  window.open(stopPDFURL.href);
};

const getDuplicatedRoutes = stop => {
  const routesToCheck = mapStopTimes(stop.stoptimesForServiceDate)
    .map(o => ({
      shortName: o.name,
      headsign: o.headsign,
    }))
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          o => o.headsign === item.headsign && o.shortName === item.shortName,
        ),
    );

  const routesWithDupes = [];
  Object.entries(groupBy(routesToCheck, 'shortName')).forEach(([key, value]) =>
    value.length > 1 ? routesWithDupes.push(key) : undefined,
  );

  return routesWithDupes;
};

const dateForPrinting = date => {
  const selectedDate = moment(date);
  return (
    <div className="printable-date-container">
      <div className="printable-date-icon">
        <Icon className="large-icon" img="icon-icon_schedule" />
      </div>
      <div className="printable-date-right">
        <div className="printable-date-header">
          <FormattedMessage id="date" defaultMessage="Date" />
        </div>
        <div className="printable-date-content">
          {moment(selectedDate).format('dd DD.MM.YYYY')}
        </div>
      </div>
    </div>
  );
};

const formTimeRow = (timetableMap, hour, showRoutes) => {
  const sortedArr = timetableMap[hour].sort(
    (time1, time2) => time1.scheduledDeparture - time2.scheduledDeparture,
  );

  const filteredRoutes = sortedArr
    .map(
      time =>
        showRoutes.filter(o => o === time.name || o === time.id).length > 0 &&
        moment.unix(time.serviceDay + time.scheduledDeparture).format('HH'),
    )
    .filter(o => o === padStart(hour % 24, 2, '0'));

  return filteredRoutes;
};

const createTimeTableRows = (timetableMap, showRoutes) =>
  Object.keys(timetableMap)
    .sort((a, b) => a - b)
    .map(hour => (
      <TimetableRow
        key={hour}
        title={padStart(hour % 24, 2, '0')}
        stoptimes={timetableMap[hour]}
        showRoutes={showRoutes}
        timerows={formTimeRow(timetableMap, hour, showRoutes)}
      />
    ));

function Timetable(
  { stop: stopRef, startDate, onDateChange, date, language },
  { router, match, config, intl },
) {
  const stop = useFragment(TimetableFragment, stopRef);
  if (!stop) {
    const path = `/${PREFIX_STOPS}`;
    if (isBrowser) {
      router.replace(path);
    } else {
      throw new RedirectException(path);
    }
  }
  const [showRoutes, setShowRoutes] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const setParams = (routes, newDate) => {
    replaceQueryParams(router, match, {
      routes,
      date: newDate,
    });
  };

  const setRouteVisibilityState = val => {
    setShowRoutes(val.showRoutes);
    const showRoutesNew = val.showRoutes.length
      ? val.showRoutes.join(',')
      : undefined;
    setParams(showRoutesNew, date);
  };

  // Reset options if stop changes
  useEffect(() => {
    setShowRoutes([]);
    setShowFilterModal(false);
  }, [stop.gtfsId]);

  useEffect(() => {
    if (match.location.query.routes) {
      setShowRoutes(match.location.query.routes?.split(',') || []);
    }
  }, [match]);

  // Check if stop is constant operation
  const { constantOperationStops } = config;
  const stopId = stop.gtfsId;
  const { locale } = intl;
  if (constantOperationStops && constantOperationStops[stopId]) {
    return (
      <div className="stop-constant-operation-container">
        <div style={{ width: '85%' }}>
          <span>{constantOperationStops[stopId][locale].text}</span>
          <span style={{ display: 'inline-block' }}>
            <a
              href={constantOperationStops[stopId][locale].link}
              target="_blank"
              rel="noreferrer"
            >
              {constantOperationStops[stopId][locale].link}
            </a>
          </span>
        </div>
      </div>
    );
  }
  // Leave out all the routes without a shortname to avoid flooding of
  // long distance buses being falsely positived as duplicates
  // then look foor routes operating under the same number but
  // different headsigns
  const duplicateRoutes = getDuplicatedRoutes(stop);
  const variantList = groupBy(
    sortBy(
      uniqBy(
        mapStopTimes(
          stop.stoptimesForServiceDate.filter(o => o.pattern.route.shortName),
        )
          .map(o => {
            const obj = Object.assign(o);
            obj.groupId = `${o.name}-${o.headsign}`;
            obj.duplicate = !!duplicateRoutes.includes(o.name);
            return obj;
          })
          .filter(o => o.duplicate === true),
        'groupId',
      ),
      'name',
    ),
    'name',
  );

  let variantsWithMarks = [];

  Object.keys(variantList).forEach(key => {
    variantsWithMarks.push(
      variantList[key].map((o, i) => {
        const obj = Object.assign(o);
        obj.duplicate = '*'.repeat(i + 1);
        return obj;
      }),
    );
  });

  variantsWithMarks = [].concat(...variantsWithMarks);

  const routesWithDetails = mapStopTimes(stop.stoptimesForServiceDate).map(
    o => {
      const obj = Object.assign(o);
      const getDuplicate = variantsWithMarks.find(
        o2 => o2.name === o.name && o2.headsign === o.headsign && o2.duplicate,
      );
      obj.duplicate = getDuplicate ? getDuplicate.duplicate : false;
      return obj;
    },
  );
  const timetableMap = groupArrayByHour(routesWithDetails);
  const { locationType } = stop;
  const stopIdSplitted = stop.gtfsId.split(':');
  const stopTimetableHandler =
    config.timetables && config.timetables[stopIdSplitted[0]];
  const stopPDFURL =
    stopTimetableHandler &&
    config.URL.STOP_TIMETABLES[stopIdSplitted[0]] &&
    locationType !== 'STATION' &&
    date
      ? stopTimetableHandler.stopTimetableUrlResolver(
          config.URL.STOP_TIMETABLES[stopIdSplitted[0]],
          stop,
          date,
          language,
        )
      : null;
  const virtualMonitorUrl =
    config.stopCard?.header?.virtualMonitorBaseUrl &&
    `${
      config.stopCard.header.virtualMonitorBaseUrl
    }/${locationType.toLowerCase()}/${stop.gtfsId}`;
  const timeTableRows = createTimeTableRows(timetableMap, showRoutes);
  const timeDifferenceDays = moment
    .duration(moment(date).diff(moment()))
    .asDays();
  return (
    <>
      <ScrollableWrapper>
        <div className="timetable scroll-target">
          {showFilterModal === true ? (
            <FilterTimeTableModal
              stop={stop}
              setRoutes={setRouteVisibilityState}
              showFilterModal={setShowFilterModal}
              showRoutesList={showRoutes}
            />
          ) : null}
          <div className="timetable-topbar">
            <DateSelect
              startDate={startDate}
              selectedDate={date}
              onDateChange={e => {
                onDateChange(e);
                const showRoutesNew = showRoutes.length
                  ? showRoutes.join(',')
                  : undefined;
                setParams(showRoutesNew, e);
                addAnalyticsEvent({
                  category: 'Stop',
                  action: 'ChangeTimetableDay',
                  name: null,
                });
              }}
              dateFormat="YYYYMMDD"
            />
            <TimeTableOptionsPanel
              showRoutes={showRoutes}
              showFilterModal={setShowFilterModal}
              stop={stop}
            />
          </div>
          <div className="timetable-for-printing-header">
            <h1>
              <FormattedMessage id="timetable" defaultMessage="Timetable" />
            </h1>
          </div>
          <div className="timetable-for-printing">{dateForPrinting(date)}</div>
          {timeTableRows.length > 0 ? (
            <div className="timetable-note">
              <h2>
                <FormattedMessage
                  id="departures-by-hour"
                  defaultMessage="Departures by hour"
                />{' '}
                <FormattedMessage
                  id="departures-by-hour-minutes-route"
                  defaultMessage="(minutes/route)"
                />
              </h2>
            </div>
          ) : (
            <div className="no-timetable-found-container">
              <div className="no-timetable-found">
                <div
                  className={cx(
                    'flex-horizontal',
                    'timetable-notification',
                    'info',
                  )}
                >
                  <Icon
                    className={cx('no-timetable-icon', 'caution')}
                    img="icon-icon_info"
                    color="#0074be"
                  />
                  {timeDifferenceDays > 30 ? (
                    <FormattedMessage
                      id="departures-not-found-time-threshold"
                      defaultMessage="No departures found"
                    />
                  ) : (
                    <FormattedMessage
                      id="departures-not-found"
                      defaultMessage="No departures found"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="momentum-scroll timetable-content-container">
            <div className="timetable-time-headers">
              <div className="hour">
                <FormattedMessage id="hour" defaultMessage="Hour" />
              </div>
              <div className="minutes-per-route">
                <FormattedMessage
                  id="minutes-or-route"
                  defaultMessage="Min/Route"
                />
              </div>
            </div>
            {timeTableRows}
            <div
              className="route-remarks"
              style={{
                display:
                  variantsWithMarks.filter(o => o.duplicate).length > 0
                    ? 'block'
                    : 'none',
              }}
            >
              <h1>
                <FormattedMessage
                  id="explanations"
                  defaultMessage="Explanations"
                />
                :
              </h1>
              {variantsWithMarks.map(o => (
                <div className="remark-row" key={`${o.id}-${o.headsign}`}>
                  <span>{`${o.name}${o.duplicate} = ${o.headsign}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollableWrapper>
      <div className="after-scrollable-area" />
      <div className="stop-page-action-bar">
        <div className="print-button-container">
          <SecondaryButton
            ariaLabel="print"
            buttonName="print"
            buttonClickAction={e => {
              printStop(e);
              addAnalyticsEvent({
                category: 'Stop',
                action: 'PrintTimetable',
                name: null,
              });
            }}
            buttonIcon="icon-icon_print"
            smallSize
          />
          {stopPDFURL && (
            <SecondaryButton
              ariaLabel="print-timetable"
              buttonName="print-timetable"
              buttonClickAction={e => {
                printStopPDF(e, stopPDFURL);
                addAnalyticsEvent({
                  category: 'Stop',
                  action: 'PrintWeeklyTimetable',
                  name: null,
                });
              }}
              buttonIcon="icon-icon_print"
              smallSize
            />
          )}
          {virtualMonitorUrl && (
            <SecondaryButton
              ariaLabel="stop-virtual-monitor"
              buttonName="stop-virtual-monitor"
              buttonClickAction={e => {
                e.preventDefault();
                window.open(virtualMonitorUrl, '_blank ');
              }}
              smallSize
            />
          )}
        </div>
      </div>
    </>
  );
}

Timetable.propTypes = {
  stop: PropTypes.shape({
    url: PropTypes.string,
    gtfsId: PropTypes.string,
    locationType: PropTypes.string,
    stoptimesForServiceDate: PropTypes.arrayOf(
      PropTypes.shape({
        pattern: PropTypes.shape({
          route: PropTypes.shape({
            shortName: PropTypes.string,
            mode: PropTypes.string.isRequired,
            agency: PropTypes.shape({
              name: PropTypes.string.isRequired,
            }).isRequired,
          }).isRequired,
        }).isRequired,
        stoptimes: PropTypes.arrayOf(
          PropTypes.shape({
            realtimeState: PropTypes.string.isRequired,
            scheduledDeparture: PropTypes.number.isRequired,
            serviceDay: PropTypes.number.isRequired,
          }),
        ).isRequired,
      }),
    ),
  }).isRequired,
  startDate: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
};

Timetable.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

Timetable.displayName = 'Timetable';

const connectedComponent = connectToStores(
  Timetable,
  ['PreferencesStore'],
  context => ({
    language: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, Timetable as Component };
