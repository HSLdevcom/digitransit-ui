/* eslint-disable import/no-unresolved */
/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape, routerShape, RedirectException } from 'found';
import moment from 'moment';
import { intlShape } from 'react-intl';
import sortBy from 'lodash/sortBy';
import cx from 'classnames';
import { dayRangePattern } from '@digitransit-util/digitransit-util';
import { getTranslatedDayString } from '@digitransit-util/digitransit-util-route-pattern-option-text';
import isEqual from 'lodash/isEqual';
import { routeShape, patternShape, configShape } from '../../util/shapes';
import ScheduleHeader from './ScheduleHeader';
import ScheduleTripRow from './ScheduleTripRow';
import SecondaryButton from '../SecondaryButton';
import Loading from '../Loading';
import { DATE_FORMAT, RealtimeStateType } from '../../constants';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import withBreakpoint from '../../util/withBreakpoint';
import hashCode from '../../util/hashUtil';
import { getFormattedTimeDate } from '../../util/timeUtils';
import ScheduleDropdown from './ScheduleDropdown';
import RouteControlPanel from './RouteControlPanel';
import { PREFIX_ROUTES, PREFIX_TIMETABLE } from '../../util/path';
import { isBrowser } from '../../util/browser';
import ScrollableWrapper from '../ScrollableWrapper';
import getTestData from './ScheduleDebugData';

const DATE_FORMAT2 = 'D.M.YYYY';

const isTripCanceled = trip =>
  trip.stoptimes &&
  trip.stoptimes.length > 0 &&
  trip.stoptimes.every(st => st.realtimeState === RealtimeStateType.Canceled);

const getMostFrequent = arr => {
  const hashmap = arr.reduce((acc, val) => {
    acc[hashCode(val.map(v => v[0]).join())] =
      (acc[hashCode(val.map(v => v[0]).join())] || 0) + 1;
    return acc;
  }, {});
  const hash = Object.keys(hashmap).reduce((a, b) =>
    hashmap[a] > hashmap[b] ? a : b,
  );
  let retValue;
  arr.forEach(a => {
    const tmpHash = hashCode(a.map(v => v[0]).join());
    if (!retValue && Number(hash) === tmpHash) {
      retValue = a;
    }
  });
  return retValue;
};

const openRoutePDF = (e, routePDFUrl) => {
  e.stopPropagation();
  window.open(routePDFUrl.href);
};

const printRouteTimetable = e => {
  e.stopPropagation();
  window.print();
};

const modifyDepartures = departures => {
  if (departures) {
    const departuresCount = Object.entries(departures).length;
    const modifiedDepartures = [];
    for (let z = 1; z <= departuresCount / 7; z++) {
      let sortedData = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(departures)) {
        const lengthToCheck = `${z}`.length + 5;
        if (key.length === lengthToCheck && key.indexOf(`wk${z}`) !== -1) {
          sortedData = {
            ...sortedData,
            [key]: sortBy(value, 'departureStoptime.scheduledDeparture'),
          };
        }
      }
      const obj = Object.values(sortedData);
      const result = Object.values(
        obj.reduce((c, v, i) => {
          const departure = obj[i]
            .map(x => x.departureStoptime.scheduledDeparture)
            .join(',');
          const hash = hashCode(departure);
          i += 1;
          c[hash] = c[hash] || ['', hash, departure];
          c[hash][0] += i;
          return c;
        }, {}),
      );
      modifiedDepartures.push(result.sort());
    }
    if (modifiedDepartures.length > 0) {
      return modifiedDepartures;
    }
  }
  return departures;
};

const isEmptyWeek = departures => {
  return (
    departures[0][0] === '1234567' &&
    departures[0][1] === 0 &&
    departures[0][2] === ''
  );
};

const getFirstDepartureDate = (departures, dateIn) => {
  if (departures.length > 0) {
    const date = dateIn || moment();
    const dayNo = moment(date).isoWeekday();
    const idx = departures.findIndex(
      departure => departure[0].indexOf(dayNo) !== -1,
    );
    if (idx > 0 && departures[idx][1] === 0 && departures[idx][2] === '') {
      // get departure day on current week
      if (departures[idx - 1][1] !== 0 && departures[idx - 1][2] !== '') {
        const newDayNo = Number(departures[idx - 1][0].substring(0, 1));
        return moment(date)
          .subtract(dayNo - newDayNo, 'd')
          .format(DATE_FORMAT);
      }
    } else if (
      idx === 0 &&
      departures[idx][1] !== 0 &&
      departures[idx][2] !== ''
    ) {
      if (
        !isEqual(
          moment(date).startOf('isoWeek').format(DATE_FORMAT),
          moment().startOf('isoWeek').format(DATE_FORMAT),
        )
      ) {
        return moment(date).format(DATE_FORMAT);
      }
      return moment().format(DATE_FORMAT);
    }
  }
  return undefined;
};

const populateData = (wantedDayIn, departures, isMerged, dataExistsDay) => {
  const departureCount = departures.length;

  const wantedDay = wantedDayIn || moment();
  const startOfWeek = moment().startOf('isoWeek');
  const today = moment();

  const currentAndNextWeekAreSame =
    departureCount >= 2 && isEqual(departures[0], departures[1]);

  const weekStarts = [
    currentAndNextWeekAreSame
      ? startOfWeek.format(DATE_FORMAT)
      : today.format(DATE_FORMAT),
  ];

  let pastDate;
  if (
    !currentAndNextWeekAreSame &&
    departures &&
    departures.length > 0 &&
    departures[0].length > 0
  ) {
    const minDayNo = Math.min(...departures[0][0][0].split('').map(Number));
    pastDate = startOfWeek
      .clone()
      .add(minDayNo - 1)
      .format(DATE_FORMAT);
    weekStarts[0] = pastDate;
  }

  const weekEnds = [startOfWeek.clone().endOf('isoWeek').format(DATE_FORMAT)];
  const days = [[]];
  const indexToRemove = [];
  const emptyWeek = [];
  for (let x = 1; x < departures.length; x++) {
    // check also first week
    if (isEmptyWeek(departures[x - 1])) {
      emptyWeek.push(
        startOfWeek
          .clone()
          .add(x - 1, 'w')
          .format(DATE_FORMAT),
      );
    }
    if (isEmptyWeek(departures[x])) {
      emptyWeek.push(startOfWeek.clone().add(x, 'w').format(DATE_FORMAT));
    }
    weekStarts.push(startOfWeek.clone().add(x, 'w').format(DATE_FORMAT));
    weekEnds.push(
      startOfWeek.clone().endOf('isoWeek').add(x, 'w').format(DATE_FORMAT),
    );
    days.push([]);
  }

  // find empty and populate days
  let notEmptyWeekFound = false;
  departures.forEach((d, idx) => {
    if (d.length === 0) {
      indexToRemove.push(idx);
    } else {
      if (d.length === 1) {
        if (d[0][1] === 0) {
          if (!notEmptyWeekFound) {
            indexToRemove.push(idx);
          }
        } else {
          notEmptyWeekFound = true;
        }
      } else {
        notEmptyWeekFound = true;
        // remove days with no departures otherwise showing later on tabs
        d = d.filter(z => z[1] !== 0);
      }
      d.forEach(x => {
        days[idx].push(x[0]);
      });
    }
  });

  // remove empty
  indexToRemove
    .sort((a, b) => b - a)
    .forEach(i => {
      weekStarts.splice(i, 1);
      weekEnds.splice(i, 1);
      days.splice(i, 1);
      departures.splice(i, 1);
    });

  // clear indexToRemove
  indexToRemove.splice(0, indexToRemove.length);

  departures.forEach((d, idx) => {
    if (idx > 0 && isEqual(departures[idx - 1], d)) {
      indexToRemove.push(idx);
    }
  });

  indexToRemove.sort((a, b) => b - a);

  indexToRemove.forEach(i => {
    days.splice(i, 1);
    weekStarts.splice(i, 1);
    weekEnds.splice(i - 1, 1);
  });

  let range = [
    wantedDay.format(DATE_FORMAT2),
    wantedDay.format(DATE_FORMAT),
    wantedDay.format('E'),
    '',
    wantedDay.clone().startOf('isoWeek').format(DATE_FORMAT),
  ];
  const options = weekStarts.map((w, idx) => {
    const currentDayNo = moment().format('E');
    const firstServiceDay = days[idx][0];
    const isSameWeek =
      startOfWeek.format(DATE_FORMAT) ===
      moment(w).startOf('isoWeek').format(DATE_FORMAT);
    const timeRangeStart =
      moment(w).format('E') <= firstServiceDay[0] &&
      departureCount === 1 &&
      (isSameWeek || idx === 0)
        ? moment(w)
            .clone()
            .add(firstServiceDay[0] - 1, 'd')
        : moment(w);
    const timeRange =
      days.length === 1 && days[idx][0].length === 1 && wantedDayIn && !isMerged
        ? wantedDay.format(DATE_FORMAT2)
        : `${timeRangeStart.format(DATE_FORMAT2)} - ${moment(
            weekEnds[idx],
          ).format(DATE_FORMAT2)}`;
    if (
      !(wantedDay.isSameOrAfter(w) && wantedDay.isSameOrBefore(weekEnds[idx]))
    ) {
      return {
        label: `${timeRange}`,
        value:
          idx === 0 &&
          days[idx].indexOf(currentDayNo) !== -1 &&
          Number(currentDayNo) > Number(firstServiceDay)
            ? moment(w)
                .clone()
                .add(currentDayNo - 1, 'd')
                .format(DATE_FORMAT)
            : moment(w)
                .clone()
                .add(firstServiceDay[0] - 1, 'd')
                .format(DATE_FORMAT),
      };
    }

    range = [
      timeRange,
      wantedDay.format(DATE_FORMAT),
      wantedDay.format('E'),
      days[idx],
      moment(weekStarts[idx]).format(DATE_FORMAT),
    ];
    return undefined;
  });

  if (!pastDate) {
    pastDate = startOfWeek
      .clone()
      .add(dataExistsDay - 1, 'd')
      .format(DATE_FORMAT);
  }

  return [
    weekStarts,
    days,
    range,
    options
      .filter(o => o)
      .filter(o => {
        return !emptyWeek.includes(o.value);
      }),
    currentAndNextWeekAreSame,
    pastDate,
  ];
};

class ScheduleContainer extends PureComponent {
  static sortTrips(trips) {
    if (trips == null) {
      return null;
    }
    return [...trips].sort((a, b) => {
      if (!Array.isArray(b.stoptimes) || b.stoptimes.length === 0) {
        return -1;
      }
      if (!Array.isArray(a.stoptimes) || a.stoptimes.length === 0) {
        return 1;
      }
      return (
        a.stoptimes[0].scheduledDeparture - b.stoptimes[0].scheduledDeparture
      );
    });
  }

  static propTypes = {
    serviceDay: PropTypes.string,
    // eslint-disable-next-line
    firstDepartures: PropTypes.object.isRequired,
    pattern: patternShape.isRequired,
    match: matchShape.isRequired,
    breakpoint: PropTypes.string.isRequired,
    router: routerShape.isRequired,
    route: routeShape.isRequired,
    lang: PropTypes.string,
  };

  static defaultProps = {
    serviceDay: undefined,
    lang: 'en',
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    config: configShape.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
  };

  state = {
    from: 0,
    to:
      (this.props.pattern && this.props.pattern.stops.length - 1) || undefined,
    hasLoaded: false,
    focusedTab: null,
  };

  tabRefs = {};

  hasMergedData = false;

  componentDidMount() {
    const { match } = this.props;
    const date = moment(match.location.query.serviceDay, DATE_FORMAT, true);
    // Don't allow past dates (before current week) because we might have no data from them
    if (
      date &&
      moment(date.clone().startOf('isoWeek').format(DATE_FORMAT)).isBefore(
        moment(moment().startOf('isoWeek').format(DATE_FORMAT)),
      )
    ) {
      match.router.replace(decodeURIComponent(match.location.pathname));
    }
  }

  onFromSelectChange = selectFrom => {
    const from = Number(selectFrom);
    this.setState(prevState => {
      const to = prevState.to > from ? prevState.to : from + 1;
      return { ...prevState.state, from, to };
    });
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableStartPoint',
      name: null,
    });
  };

  onToSelectChange = selectTo => {
    const to = Number(selectTo);
    this.setState(prevState => ({ ...prevState.state, to }));
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableEndPoint',
      name: null,
    });
  };

  getTrips = (patternIn, from, to, newServiceDay, wantedDay) => {
    let currentPattern = patternIn;
    let queryParams = newServiceDay ? `?serviceDay=${newServiceDay}` : '';

    if (this.testing && this.testNum && currentPattern) {
      currentPattern = {
        ...currentPattern,
        trips: currentPattern.trips?.filter((s, i) => i < 2),
      };
      if (
        moment(wantedDay, 'YYYYMMDD', true).isValid() &&
        moment(this.testNoDataDay, 'YYYYMMDD', true).isValid() &&
        wantedDay.format(DATE_FORMAT) === this.testNoDataDay
      ) {
        currentPattern = {
          ...currentPattern,
          trips: [],
        };
      }
      queryParams = queryParams.concat(`&test=${this.testNum}`);
    }

    const trips = ScheduleContainer.sortTrips(currentPattern.trips);

    if (trips.length === 0 && newServiceDay) {
      return `/${PREFIX_ROUTES}/${this.props.match.params.routeId}/${PREFIX_TIMETABLE}/${currentPattern.code}${queryParams}`;
    }

    if (trips !== null && !this.state.hasLoaded) {
      this.setState({
        hasLoaded: true,
      });
      return (
        <div className={cx('summary-list-spinner-container', 'route-schedule')}>
          <Loading />
        </div>
      );
    }

    if (trips.length === 0) {
      return (
        <div className="text-center">
          {this.context.intl.formatMessage(
            {
              id: 'no-trips-found',
              defaultMessage: `No journeys found for the selected date ${moment(
                this.context.match.location.query.serviceDay,
              ).format(DATE_FORMAT2)}`,
            },
            {
              selectedDate: moment(
                this.context.match.location.query.serviceDay,
              ).format(DATE_FORMAT2),
            },
          )}
        </div>
      );
    }

    return trips.map(trip => {
      const fromSt = trip.stoptimes[from];
      const toSt = trip.stoptimes[to];
      const departureTime = getFormattedTimeDate(
        (fromSt.serviceDay + fromSt.scheduledDeparture) * 1000,
        'HH:mm',
      );
      const arrivalTime = getFormattedTimeDate(
        (toSt.serviceDay + toSt.scheduledArrival) * 1000,
        'HH:mm',
      );

      return (
        <ScheduleTripRow
          key={`${trip.id}-${departureTime}`}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          isCanceled={isTripCanceled(trip)}
        />
      );
    });
  };

  changeDate = newServiceDay => {
    const { location } = this.context.match;
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
    this.context.router.replace(newPath);
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.pattern.code !== this.props.pattern.code) {
      this.setState({
        from: 0,
        to: nextProps.pattern.stops.length - 1,
      });
    }
  }

  renderDayTabs = data => {
    const dayArray =
      data && data.length >= 3 && data[2].length >= 4 ? data[2][3] : undefined;
    if (!dayArray || (dayArray.length === 1 && dayArray[0] === '1234567')) {
      return null;
    }

    if (dayArray.length > 0) {
      const singleDays = dayArray.filter(s => s.length === 1);
      const multiDays = dayArray.filter(s => s.length !== 1);
      let dayTabs = multiDays.map(m => {
        const daySplitted = m.split('');
        let idx = 0;
        const tabs = daySplitted.reduce((r, n, i) => {
          r[idx] = r[idx] || n;
          if (i > 0 && i < m.length) {
            if (Number(n) - Number(m[i - 1]) === 1) {
              r[idx] += n;
            } else {
              idx += 1;
              r[idx] = r[idx] || n;
            }
          }
          return r;
        }, []);
        return tabs;
      });

      const separatedMultiDays = [];
      dayTabs.forEach(d => {
        d.forEach(x => {
          separatedMultiDays.push(x);
        });
      });

      dayTabs = singleDays
        .concat(separatedMultiDays)
        .filter(d => d)
        .sort();

      const count = dayTabs.length;
      const weekStartDate = moment(data[2][1]).startOf('isoWeek');
      const isSameWeek =
        weekStartDate.format(DATE_FORMAT) ===
        moment().startOf('isoWeek').format(DATE_FORMAT);
      const firstDay = dayTabs[0][0];
      let { focusedTab } = this.state;
      const tabs = dayTabs.map((tab, id) => {
        const selected =
          tab.indexOf(data[2][2]) !== -1 ||
          (tab.indexOf(firstDay) !== -1 &&
            !isSameWeek &&
            dayTabs.indexOf(data[2][2]) === id) ||
          count === 1;
        // create refs and set focused tab needed for accessibilty here, not ideal but works
        if (!this.tabRefs[tab]) {
          this.tabRefs[tab] = React.createRef();
        }
        if (!focusedTab && selected) {
          focusedTab = tab;
        }

        let tabDate = moment(data[2][4]);
        if (
          data[4] &&
          data[5] &&
          !isEqual(
            tabDate.clone().format(DATE_FORMAT),
            moment(data[5]).format(DATE_FORMAT),
          )
        ) {
          if (
            moment(data[5]).isAfter(
              tabDate
                .clone()
                .add(Number(tab[0]) - 1, 'd')
                .format(DATE_FORMAT),
            )
          ) {
            tabDate = tabDate.clone().add(Number(tab[0]) + 6, 'd');
          } else {
            tabDate = tabDate.clone().add(Number(tab[0]) - 1, 'd');
          }
        } else {
          tabDate = tabDate.clone().add(Number(tab[0]) - 1, 'd');
        }

        return (
          <button
            type="button"
            disabled={dayArray.length === 1 && separatedMultiDays.length < 2}
            key={tab}
            className={cx({
              'is-active': selected,
            })}
            onClick={() => {
              this.changeDate(tabDate.format(DATE_FORMAT));
            }}
            ref={this.tabRefs[tab]}
            tabIndex={selected ? 0 : -1}
            role="tab"
            aria-selected={selected}
            style={{
              '--totalCount': `${count}`,
            }}
          >
            {getTranslatedDayString(
              this.context.intl.locale,
              dayRangePattern(tab.split('')),
              true,
            )}
          </button>
        );
      });

      if (dayTabs.length > 0) {
        /* eslint-disable jsx-a11y/interactive-supports-focus */
        return (
          <div
            className="route-tabs days"
            role="tablist"
            onKeyDown={e => {
              const tabCount = count;
              const activeIndex = dayTabs.indexOf(focusedTab);
              let index;
              switch (e.nativeEvent.code) {
                case 'ArrowLeft':
                  index = (activeIndex - 1 + tabCount) % tabCount;
                  this.tabRefs[dayTabs[index]].current.focus();
                  this.setState({ focusedTab: dayTabs[index] });
                  break;
                case 'ArrowRight':
                  index = (activeIndex + 1) % tabCount;
                  this.tabRefs[dayTabs[index]].current.focus();
                  this.setState({ focusedTab: dayTabs[index] });
                  break;
                default:
                  break;
              }
            }}
          >
            {tabs}
          </div>
        );
        /* eslint-enable jsx-a11y/interactive-supports-focus */
      }
    }
    return '';
  };

  redirectWithServiceDay = serviceDay => {
    const { location } = this.context.match;
    const newPath = {
      ...location,
      query: {
        ...location.query,
        serviceDay,
      },
    };
    if (isBrowser) {
      this.props.match.router.replace(newPath);
    } else {
      throw new RedirectException(newPath);
    }
  };

  render() {
    // Check if route is constant operation first to avoid redundant calculation
    const routeId = this.props.route?.gtfsId;
    const { constantOperationRoutes } = this.context.config;
    const { locale } = this.context.intl;
    if (routeId && constantOperationRoutes[routeId]) {
      return (
        <div
          className={`route-schedule-container ${
            this.props.breakpoint !== 'large' ? 'mobile' : ''
          }`}
        >
          <div style={{ paddingBottom: '28px' }}>
            <RouteControlPanel
              match={this.props.match}
              route={this.props.route}
              breakpoint={this.props.breakpoint}
              noInitialServiceDay
            />
          </div>
          <div className="stop-constant-operation-container bottom-padding">
            <div style={{ width: '95%' }}>
              <span>{constantOperationRoutes[routeId][locale].text}</span>
              <span style={{ display: 'inline-block' }}>
                <a
                  href={constantOperationRoutes[routeId][locale].link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {constantOperationRoutes[routeId][locale].link}
                </a>
              </span>
            </div>
          </div>
        </div>
      );
    }

    const { query } = this.props.match.location;
    const { intl } = this.context;
    this.hasMergedData = false;
    this.dataExistsDay = 1; // 1 = monday
    // USE FOR TESTING PURPOSE
    this.testing = process.env.ROUTEPAGETESTING || false;
    this.testNum = this.testing && query && query.test;
    this.testNoDataDay = ''; // set to next week's Thursday

    if (!this.props.pattern) {
      if (this.props.match.params.routeId) {
        if (isBrowser) {
          // Redirect back to routes default pattern
          // eslint-disable-next-line react/prop-types
          this.props.router.replace(
            `/${PREFIX_ROUTES}/${this.props.match.params.routeId}/${PREFIX_TIMETABLE}`,
          );
        } else {
          throw new RedirectException(
            `/${PREFIX_ROUTES}/${this.props.match.params.routeId}/${PREFIX_TIMETABLE}`,
          );
        }
      }
      return false;
    }

    const newFromTo = [this.state.from, this.state.to];

    const currentPattern = this.props.route.patterns.filter(
      p => p.code === this.props.pattern.code,
    );

    let dataToHandle;

    if (this.testing && this.testNum) {
      dataToHandle = getTestData(this.testNum);
    } else {
      dataToHandle = this.props.firstDepartures;
    }
    const firstDepartures = modifyDepartures(dataToHandle);
    const firstWeekEmpty = isEmptyWeek(firstDepartures[0]);
    // If we are missing data from the start of the week, see if we can merge it with next week
    if (
      !firstWeekEmpty &&
      firstDepartures[0].length !== 0 &&
      dataToHandle.wk1mon.length === 0
    ) {
      const [thisWeekData, normalWeekData] =
        Number(this.testNum) === 0
          ? firstDepartures
          : [firstDepartures[0], getMostFrequent(firstDepartures)];
      const thisWeekHashes = [];
      const nextWeekHashes = [];

      for (let i = 0; i < thisWeekData.length; i++) {
        thisWeekHashes.push(thisWeekData[i][1]);
      }
      for (let i = 0; i < normalWeekData.length; i++) {
        nextWeekHashes.push(normalWeekData[i][1]);
      }

      // If this weeks data is a subset of normal weeks data, merge them
      if (thisWeekHashes.every(hash => nextWeekHashes.includes(hash))) {
        // eslint-disable-next-line prefer-destructuring
        firstDepartures[0] = normalWeekData;
        this.hasMergedData = true;
      }
    }

    if (this.hasMergedData) {
      if (dataToHandle.wk1tue.length !== 0) {
        this.dataExistsDay = 2;
      } else if (dataToHandle.wk1wed.length !== 0) {
        this.dataExistsDay = 3;
      } else if (dataToHandle.wk1thu.length !== 0) {
        this.dataExistsDay = 4;
      } else if (dataToHandle.wk1fri.length !== 0) {
        this.dataExistsDay = 5;
      } else if (dataToHandle.wk1sat.length !== 0) {
        this.dataExistsDay = 6;
      } else if (dataToHandle.wk1sun.length !== 0) {
        this.dataExistsDay = 7;
      }
    }

    const wantedDay =
      query &&
      query.serviceDay &&
      moment(query.serviceDay, 'YYYYMMDD', true).isValid()
        ? moment(query.serviceDay)
        : undefined;

    const firstDataDate = moment()
      .startOf('isoWeek')
      .add(this.dataExistsDay - 1, 'd')
      .format(DATE_FORMAT);

    // check if first week is empty and redirect if is
    const nextMonday = moment()
      .startOf('isoWeek')
      .add(1, 'w')
      .format(DATE_FORMAT);

    const firstDepartureDate = getFirstDepartureDate(
      firstDepartures[0],
      wantedDay,
    );
    const isBeforeNextWeek = wantedDay
      ? moment(wantedDay).isBefore(moment(nextMonday))
      : false;
    const isSameOrAfterNextWeek = wantedDay
      ? moment(wantedDay).isSameOrAfter(moment(nextMonday))
      : false;

    // Checking is wanted day is before first available day when data is found
    const isBeforeFirstDataDate = wantedDay
      ? moment(wantedDay).isBefore(moment(firstDataDate))
      : false;

    if ((!this.testNum || this.testNum !== 0) && isBeforeFirstDataDate) {
      this.redirectWithServiceDay(firstDataDate);
    } else if ((isBeforeNextWeek && firstWeekEmpty) || firstDepartureDate) {
      if (
        !isEqual(moment().format(DATE_FORMAT), firstDepartureDate) &&
        !isSameOrAfterNextWeek
      ) {
        this.redirectWithServiceDay(firstDepartureDate || nextMonday);
      }
    }

    const data = populateData(
      wantedDay,
      firstDepartures,
      this.hasMergedData,
      this.dataExistsDay,
    );

    let newServiceDay;

    if (!wantedDay && data && data.length >= 3 && data[2].length >= 4) {
      if (data[2][3] !== '') {
        if (data[2][2] !== data[2][3][0].charAt(0)) {
          newServiceDay = moment()
            .startOf('isoWeek')
            .add(Number(data[2][3][0].charAt(0)) - 1, 'd')
            .format(DATE_FORMAT);
        }
      } else if (
        data[3] &&
        data[3][0] &&
        data[2][1] &&
        moment(data[2][1]).isBefore(data[0][0])
      ) {
        newServiceDay = data[3][0].value;
      }
      if (moment(newServiceDay).isAfter(moment(firstDataDate))) {
        newServiceDay = firstDataDate;
      }
    }

    const routeIdSplitted = this.props.match.params.routeId.split(':');
    const routeTimetableHandler = routeIdSplitted
      ? this.context.config.timetables &&
        this.context.config.timetables[routeIdSplitted[0]]
      : undefined;

    const routeTimetableUrl =
      routeTimetableHandler &&
      this.context.config.URL.ROUTE_TIMETABLES[routeIdSplitted[0]] &&
      routeTimetableHandler.routeTimetableUrlResolver(
        this.context.config.URL.ROUTE_TIMETABLES[routeIdSplitted[0]],
        this.props.route,
        newServiceDay,
        this.props.lang,
      );

    const showTrips = this.getTrips(
      currentPattern[0],
      newFromTo[0],
      newFromTo[1],
      newServiceDay,
      wantedDay,
    );

    const tabs = this.renderDayTabs(data);

    if (showTrips && typeof showTrips === 'string') {
      if (isBrowser) {
        this.props.match.router.replace(showTrips);
      } else {
        throw new RedirectException(showTrips);
      }
      return false;
    }

    if (!this.state.hasLoaded) {
      return (
        <div className={cx('summary-list-spinner-container', 'route-schedule')}>
          <Loading />
        </div>
      );
    }
    return (
      <>
        <ScrollableWrapper
          className={`route-schedule-container ${
            this.props.breakpoint !== 'large' ? 'mobile' : ''
          }`}
        >
          {this.props.route && this.props.route.patterns && (
            <RouteControlPanel
              match={this.props.match}
              route={this.props.route}
              breakpoint={this.props.breakpoint}
              noInitialServiceDay
            />
          )}
          <div className="route-schedule-ranges">
            <span className="current-range">{data[2][0]}</span>
            <div className="other-ranges-dropdown">
              {data[3].length > 0 && (
                <ScheduleDropdown
                  id="other-dates"
                  title={intl.formatMessage({
                    id: 'other-dates',
                  })}
                  list={data[3]}
                  alignRight
                  changeTitleOnChange={false}
                  onSelectChange={this.changeDate}
                />
              )}
            </div>
          </div>
          {tabs}
          {this.props.pattern && (
            <div
              className={cx('route-schedule-list-wrapper', {
                'bp-large': this.props.breakpoint === 'large',
              })}
              aria-live="polite"
            >
              <ScheduleHeader
                stops={this.props.pattern.stops}
                from={newFromTo[0]}
                to={newFromTo[1]}
                onFromSelectChange={this.onFromSelectChange}
                onToSelectChange={this.onToSelectChange}
              />
              <div
                className="route-schedule-list momentum-scroll"
                role="list"
                aria-live="off"
              >
                {showTrips}
              </div>
            </div>
          )}
        </ScrollableWrapper>
        {this.props.breakpoint === 'large' && (
          <div className="after-scrollable-area" />
        )}
        <div className="route-page-action-bar">
          <div className="print-button-container">
            {routeTimetableUrl && (
              <SecondaryButton
                ariaLabel="print-timetable"
                buttonName="print-timetable"
                buttonClickAction={e => {
                  openRoutePDF(e, routeTimetableUrl);
                  addAnalyticsEvent({
                    category: 'Route',
                    action: 'PrintWeeklyTimetable',
                    name: null,
                  });
                }}
                buttonIcon="icon-icon_print"
                smallSize
              />
            )}
            <SecondaryButton
              ariaLabel="print"
              buttonName="print"
              buttonClickAction={e => {
                printRouteTimetable(e);
                addAnalyticsEvent({
                  category: 'Route',
                  action: 'PrintTimetable',
                  name: null,
                });
              }}
              buttonIcon="icon-icon_print"
              smallSize
            />
          </div>
        </div>
      </>
    );
  }
}

const containerComponent = createFragmentContainer(
  connectToStores(
    withBreakpoint(ScheduleContainer),
    ['PreferencesStore'],
    context => ({
      lang: context.getStore('PreferencesStore').getLanguage(),
    }),
  ),
  {
    pattern: graphql`
      fragment ScheduleContainer_pattern on Pattern {
        id
        code
        stops {
          id
          name
        }
      }
    `,
    route: graphql`
      fragment ScheduleContainer_route on Route
      @argumentDefinitions(
        date: { type: "String" }
        serviceDate: { type: "String" }
      ) {
        gtfsId
        color
        shortName
        longName
        mode
        type
        ...RouteAgencyInfo_route
        ...RoutePatternSelect_route @arguments(date: $date)
        agency {
          name
          phone
        }
        patterns {
          alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
            id
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
          }
          headsign
          code
          stops {
            name
          }
          trips: tripsForDate(serviceDate: $serviceDate) {
            stoptimes: stoptimesForDate(serviceDate: $serviceDate) {
              stop {
                id
              }
              realtimeState
              scheduledArrival
              scheduledDeparture
              serviceDay
            }
          }
          activeDates: trips {
            serviceId
            day: activeDates
          }
        }
      }
    `,
    firstDepartures: graphql`
      fragment ScheduleContainer_firstDepartures on Pattern
      @argumentDefinitions(
        showTenWeeks: { type: "Boolean!", defaultValue: false }
        wk1day1: { type: "String!", defaultValue: "19700101" }
        wk1day2: { type: "String!", defaultValue: "19700101" }
        wk1day3: { type: "String!", defaultValue: "19700101" }
        wk1day4: { type: "String!", defaultValue: "19700101" }
        wk1day5: { type: "String!", defaultValue: "19700101" }
        wk1day6: { type: "String!", defaultValue: "19700101" }
        wk1day7: { type: "String!", defaultValue: "19700101" }
        wk2day1: { type: "String!", defaultValue: "19700101" }
        wk2day2: { type: "String!", defaultValue: "19700101" }
        wk2day3: { type: "String!", defaultValue: "19700101" }
        wk2day4: { type: "String!", defaultValue: "19700101" }
        wk2day5: { type: "String!", defaultValue: "19700101" }
        wk2day6: { type: "String!", defaultValue: "19700101" }
        wk2day7: { type: "String!", defaultValue: "19700101" }
        wk3day1: { type: "String!", defaultValue: "19700101" }
        wk3day2: { type: "String!", defaultValue: "19700101" }
        wk3day3: { type: "String!", defaultValue: "19700101" }
        wk3day4: { type: "String!", defaultValue: "19700101" }
        wk3day5: { type: "String!", defaultValue: "19700101" }
        wk3day6: { type: "String!", defaultValue: "19700101" }
        wk3day7: { type: "String!", defaultValue: "19700101" }
        wk4day1: { type: "String!", defaultValue: "19700101" }
        wk4day2: { type: "String!", defaultValue: "19700101" }
        wk4day3: { type: "String!", defaultValue: "19700101" }
        wk4day4: { type: "String!", defaultValue: "19700101" }
        wk4day5: { type: "String!", defaultValue: "19700101" }
        wk4day6: { type: "String!", defaultValue: "19700101" }
        wk4day7: { type: "String!", defaultValue: "19700101" }
        wk5day1: { type: "String!", defaultValue: "19700101" }
        wk5day2: { type: "String!", defaultValue: "19700101" }
        wk5day3: { type: "String!", defaultValue: "19700101" }
        wk5day4: { type: "String!", defaultValue: "19700101" }
        wk5day5: { type: "String!", defaultValue: "19700101" }
        wk5day6: { type: "String!", defaultValue: "19700101" }
        wk5day7: { type: "String!", defaultValue: "19700101" }
        wk6day1: { type: "String" }
        wk6day2: { type: "String" }
        wk6day3: { type: "String" }
        wk6day4: { type: "String" }
        wk6day5: { type: "String" }
        wk6day6: { type: "String" }
        wk6day7: { type: "String" }
        wk7day1: { type: "String" }
        wk7day2: { type: "String" }
        wk7day3: { type: "String" }
        wk7day4: { type: "String" }
        wk7day5: { type: "String" }
        wk7day6: { type: "String" }
        wk7day7: { type: "String" }
        wk8day1: { type: "String" }
        wk8day2: { type: "String" }
        wk8day3: { type: "String" }
        wk8day4: { type: "String" }
        wk8day5: { type: "String" }
        wk8day6: { type: "String" }
        wk8day7: { type: "String" }
        wk9day1: { type: "String" }
        wk9day2: { type: "String" }
        wk9day3: { type: "String" }
        wk9day4: { type: "String" }
        wk9day5: { type: "String" }
        wk9day6: { type: "String" }
        wk9day7: { type: "String" }
        wk10day1: { type: "String" }
        wk10day2: { type: "String" }
        wk10day3: { type: "String" }
        wk10day4: { type: "String" }
        wk10day5: { type: "String" }
        wk10day6: { type: "String" }
        wk10day7: { type: "String" }
      ) {
        wk1mon: tripsForDate(serviceDate: $wk1day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2mon: tripsForDate(serviceDate: $wk2day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3mon: tripsForDate(serviceDate: $wk3day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4mon: tripsForDate(serviceDate: $wk4day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5mon: tripsForDate(serviceDate: $wk5day1) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6mon: tripsForDate(serviceDate: $wk6day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7mon: tripsForDate(serviceDate: $wk7day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8mon: tripsForDate(serviceDate: $wk8day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9mon: tripsForDate(serviceDate: $wk9day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10mon: tripsForDate(serviceDate: $wk10day1)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1tue: tripsForDate(serviceDate: $wk1day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2tue: tripsForDate(serviceDate: $wk2day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3tue: tripsForDate(serviceDate: $wk3day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4tue: tripsForDate(serviceDate: $wk4day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5tue: tripsForDate(serviceDate: $wk5day2) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6tue: tripsForDate(serviceDate: $wk6day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7tue: tripsForDate(serviceDate: $wk7day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8tue: tripsForDate(serviceDate: $wk8day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9tue: tripsForDate(serviceDate: $wk9day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10tue: tripsForDate(serviceDate: $wk10day2)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1wed: tripsForDate(serviceDate: $wk1day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2wed: tripsForDate(serviceDate: $wk2day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3wed: tripsForDate(serviceDate: $wk3day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4wed: tripsForDate(serviceDate: $wk4day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5wed: tripsForDate(serviceDate: $wk5day3) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6wed: tripsForDate(serviceDate: $wk6day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7wed: tripsForDate(serviceDate: $wk7day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8wed: tripsForDate(serviceDate: $wk8day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9wed: tripsForDate(serviceDate: $wk9day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10wed: tripsForDate(serviceDate: $wk10day3)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1thu: tripsForDate(serviceDate: $wk1day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2thu: tripsForDate(serviceDate: $wk2day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3thu: tripsForDate(serviceDate: $wk3day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4thu: tripsForDate(serviceDate: $wk4day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5thu: tripsForDate(serviceDate: $wk5day4) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6thu: tripsForDate(serviceDate: $wk6day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7thu: tripsForDate(serviceDate: $wk7day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8thu: tripsForDate(serviceDate: $wk8day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9thu: tripsForDate(serviceDate: $wk9day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10thu: tripsForDate(serviceDate: $wk10day4)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1fri: tripsForDate(serviceDate: $wk1day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2fri: tripsForDate(serviceDate: $wk2day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3fri: tripsForDate(serviceDate: $wk3day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4fri: tripsForDate(serviceDate: $wk4day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5fri: tripsForDate(serviceDate: $wk5day5) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6fri: tripsForDate(serviceDate: $wk6day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7fri: tripsForDate(serviceDate: $wk7day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8fri: tripsForDate(serviceDate: $wk8day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9fri: tripsForDate(serviceDate: $wk9day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10fri: tripsForDate(serviceDate: $wk10day5)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1sat: tripsForDate(serviceDate: $wk1day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2sat: tripsForDate(serviceDate: $wk2day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3sat: tripsForDate(serviceDate: $wk3day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4sat: tripsForDate(serviceDate: $wk4day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5sat: tripsForDate(serviceDate: $wk5day6) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6sat: tripsForDate(serviceDate: $wk6day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7sat: tripsForDate(serviceDate: $wk7day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8sat: tripsForDate(serviceDate: $wk8day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9sat: tripsForDate(serviceDate: $wk9day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10sat: tripsForDate(serviceDate: $wk10day6)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk1sun: tripsForDate(serviceDate: $wk1day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk2sun: tripsForDate(serviceDate: $wk2day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk3sun: tripsForDate(serviceDate: $wk3day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk4sun: tripsForDate(serviceDate: $wk4day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk5sun: tripsForDate(serviceDate: $wk5day7) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk6sun: tripsForDate(serviceDate: $wk6day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk7sun: tripsForDate(serviceDate: $wk7day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk8sun: tripsForDate(serviceDate: $wk8day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk9sun: tripsForDate(serviceDate: $wk9day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
        wk10sun: tripsForDate(serviceDate: $wk10day7)
          @include(if: $showTenWeeks) {
          departureStoptime {
            scheduledDeparture
          }
        }
      }
    `,
  },
);

export { containerComponent as default, ScheduleContainer as Component };
