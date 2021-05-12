/* eslint-disable import/no-unresolved */
/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { matchShape, routerShape } from 'found';
import moment from 'moment';
import { intlShape, FormattedMessage } from 'react-intl';
import keyBy from 'lodash/keyBy';
import sortBy from 'lodash/sortBy';
import cx from 'classnames';
import { dayRangePattern } from '@digitransit-util/digitransit-util';
import { getTranslatedDayString } from '@digitransit-util/digitransit-util-route-pattern-option-text';
import pure from 'recompose/pure';
import RouteScheduleHeader from './RouteScheduleHeader';
import RouteScheduleTripRow from './RouteScheduleTripRow';
import SecondaryButton from './SecondaryButton';
import Loading from './Loading';
import Icon from './Icon';
import { DATE_FORMAT, RealtimeStateType } from '../constants';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import withBreakpoint from '../util/withBreakpoint';
import hashCode from '../util/hashUtil';
import RouteScheduleDropdown from './RouteScheduleDropdown';
import RoutePageControlPanel from './RoutePageControlPanel';
import { PREFIX_ROUTES, PREFIX_TIMETABLE } from '../util/path';
import { isBrowser } from '../util/browser';

const DATE_FORMAT2 = 'D.M.YYYY';

const isTripCanceled = trip =>
  trip.stoptimes &&
  Object.keys(trip.stoptimes)
    .map(key => trip.stoptimes[key])
    .every(st => st.realtimeState === RealtimeStateType.Canceled);

class RouteScheduleContainer extends Component {
  static transformTrips(trips, stops) {
    if (trips == null) {
      return null;
    }
    let transformedTrips = trips.map(trip => {
      const newTrip = { ...trip };
      newTrip.stoptimes = keyBy(trip.stoptimes, 'stop.id');
      return newTrip;
    });
    transformedTrips = sortBy(
      transformedTrips,
      trip => trip.stoptimes[stops[0].id].scheduledDeparture,
    );
    return transformedTrips;
  }

  static propTypes = {
    pattern: PropTypes.object.isRequired,
    serviceDay: PropTypes.string,
    match: matchShape.isRequired,
    breakpoint: PropTypes.string.isRequired,
    firstDepartures: PropTypes.object.isRequired,
  };

  static defaultProps = {
    serviceDay: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
  };

  state = {
    from: 0,
    to: this.props.pattern?.stops.length - 1 || undefined,
    serviceDay: this.props.serviceDay,
    hasLoaded: false,
  };

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

  getTrips = (from, to) => {
    const { stops } = this.props.pattern;
    const trips = RouteScheduleContainer.transformTrips(
      this.props.pattern.tripsForDate,
      stops,
    );
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
          {this.context.intl.formatMessage({
            id: 'no-trips-found',
            defaultMessage: 'No journeys found for the selected date.',
          })}
        </div>
      );
    }
    return trips.map(trip => {
      const fromSt = trip.stoptimes[stops[from].id];
      const toSt = trip.stoptimes[stops[to].id];
      const departureTime = this.formatTime(
        fromSt.serviceDay + fromSt.scheduledDeparture,
      );
      const arrivalTime = this.formatTime(
        toSt.serviceDay + toSt.scheduledArrival,
      );

      return (
        <RouteScheduleTripRow
          key={trip.id}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          isCanceled={isTripCanceled(trip)}
        />
      );
    });
  };

  formatTime = timestamp => moment(timestamp * 1000).format('HH:mm');

  changeDate = newServiceDay => {
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableDay',
      name: null,
    });
    const newPath = {
      ...this.context.match.location,
      query: {
        serviceDay: newServiceDay,
      },
    };
    this.context.router.replace(newPath);
  };

  dateForPrinting = () => {
    const selectedDate = moment(this.state.serviceDay);
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

  openRoutePDF = (e, routePDFUrl) => {
    e.stopPropagation();
    window.open(routePDFUrl);
  };

  printRouteTimetable = e => {
    e.stopPropagation();
    window.print();
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

  modifyDepartures = departures => {
    if (departures) {
      const modifiedDepartures = [];
      for (let z = 1; z <= 5; z++) {
        let sortedData = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of Object.entries(departures)) {
          if (key.indexOf(`wk${z}`) !== -1) {
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
        modifiedDepartures.push(result.sort().filter(x => x[2].length > 0));
      }
      return modifiedDepartures;
    }
    return departures;
  };

  renderDayTabs = data => {
    const dayArray = data[2][3];
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
      const tabs = dayTabs.map((tab, id) => {
        return (
          <button
            type="button"
            key={tab}
            className={cx({
              'is-active':
                tab.indexOf(data[2][2]) !== -1 ||
                (tab.indexOf(firstDay) !== -1 &&
                  !isSameWeek &&
                  dayTabs.indexOf(data[2][2]) === id) ||
                count === 1,
            })}
            onClick={() => {
              this.changeDate(
                weekStartDate
                  .clone()
                  .add(
                    tab.indexOf(data[2][2]) !== -1
                      ? data[2][2] - 1
                      : tab[0] - 1,
                    'd',
                  )
                  .format(DATE_FORMAT),
              );
            }}
            tabIndex={0}
            role="tab"
            aria-selected
            style={{
              '--totalCount': `${count}`,
            }}
          >
            {getTranslatedDayString('fi', dayRangePattern(tab.split('')), true)}
          </button>
        );
      });

      if (dayTabs.length > 0) {
        return (
          <div className="route-tabs days" role="tablist">
            {tabs}
          </div>
        );
      }
    }
    return '';
  };

  populateData = (wantedDay, departures) => {
    const startOfWeek = moment().startOf('isoWeek');
    const weekStarts = [];
    const weekEnds = [];
    const days = [];
    const indexToRemove = [];
    for (let x = 0; x < 5; x++) {
      weekStarts.push(startOfWeek.clone().add(x, 'w').format(DATE_FORMAT));
      weekEnds.push(
        startOfWeek.clone().endOf('isoWeek').add(x, 'w').format(DATE_FORMAT),
      );
      days.push([]);
    }

    // find empty and populate days
    departures.forEach((d, idx) => {
      if (d.length === 0) {
        indexToRemove.push(idx);
      } else {
        d.forEach(x => days[idx].push(x[0]));
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
      if (
        idx > 0 &&
        departures[idx - 1][0][0] === d[0][0] &&
        departures[idx - 1][0][1] === d[0][1]
      ) {
        indexToRemove.push(idx);
      }
    });

    indexToRemove.sort((a, b) => b - a);

    indexToRemove.map(i => {
      days.splice(i, 1);
      weekStarts.splice(i, 1);
      weekEnds.splice(i - 1, 1);
      return undefined;
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
        moment(w).format('E') <= firstServiceDay[0] && (isSameWeek || idx === 0)
          ? moment(w)
              .clone()
              .add(firstServiceDay[0] - 1, 'd')
              .format(DATE_FORMAT2)
          : moment(w).format(DATE_FORMAT2);
      const timeRange =
        days.length === 1 && days[idx].length === 1
          ? wantedDay.format(DATE_FORMAT2)
          : `${timeRangeStart} - ${moment(weekEnds[idx]).format(DATE_FORMAT2)}`;
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
    return [weekStarts, days, range, options.filter(o => o)];
  };

  render() {
    const { query } = this.props.match.location;
    const { intl } = this.context;

    if (!this.props.pattern) {
      if (isBrowser) {
        if (this.props.match.params.routeId) {
          // Redirect back to routes default pattern
          // eslint-disable-next-line react/prop-types
          this.props.router.replace(
            `/${PREFIX_ROUTES}/${this.props.match.params.routeId}/${PREFIX_TIMETABLE}`,
          );
        }
        return false;
      }
      return false;
    }

    const wantedDay =
      query &&
      query.serviceDay &&
      moment(query.serviceDay, 'YYYYMMDD', true).isValid()
        ? moment(query.serviceDay)
        : moment();

    const newFromTo = [this.state.from, this.state.to];

    const routeIdSplitted = this.props.pattern.route.gtfsId.split(':');
    const firstDepartures = this.modifyDepartures(this.props.firstDepartures);
    const data = this.populateData(wantedDay, firstDepartures);

    const routeTimetableHandler = routeIdSplitted
      ? this.context.config.timetables &&
        this.context.config.timetables[routeIdSplitted[0]]
      : undefined;

    const routeTimetableUrl =
      routeTimetableHandler &&
      this.context.config.URL.ROUTE_TIMETABLES[routeIdSplitted[0]] &&
      routeTimetableHandler.timetableUrlResolver(
        this.context.config.URL.ROUTE_TIMETABLES[routeIdSplitted[0]],
        this.props.pattern.route,
      );

    const showTrips = this.getTrips(newFromTo[0], newFromTo[1]);

    if (!this.state.hasLoaded) {
      return (
        <div className={cx('summary-list-spinner-container', 'route-schedule')}>
          <Loading />
        </div>
      );
    }
    return (
      <>
        <div
          className={`route-schedule-container momentum-scroll ${
            this.props.breakpoint !== 'large' ? 'mobile' : ''
          }`}
          role="list"
        >
          <RoutePageControlPanel
            match={this.props.match}
            route={this.props.pattern.route}
            breakpoint={this.props.breakpoint}
            noInitialServiceDay
          />
          <div className="route-schedule-ranges">
            <span className="current-range">{data[2][0]}</span>
            <div className="other-ranges-dropdown">
              {data[3].length > 0 && (
                <RouteScheduleDropdown
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
          {this.renderDayTabs(data)}
          {this.props.pattern && (
            <div
              className={cx('route-schedule-list-wrapper', {
                'bp-large': this.props.breakpoint === 'large',
              })}
              aria-live="polite"
            >
              <RouteScheduleHeader
                stops={this.props.pattern.stops}
                from={newFromTo[0]}
                to={newFromTo[1]}
                onFromSelectChange={this.onFromSelectChange}
                onToSelectChange={this.onToSelectChange}
              />
              <div
                className="route-schedule-list momentum-scroll"
                role="list"
                aria-atomic="true"
              >
                {showTrips}
              </div>
            </div>
          )}
        </div>
        <div className="route-page-action-bar">
          <div className="print-button-container">
            {routeTimetableUrl && (
              <SecondaryButton
                ariaLabel="print-timetable"
                buttonName="print-timetable"
                buttonClickAction={e => {
                  this.openRoutePDF(e, routeTimetableUrl);
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
                this.printRouteTimetable(e);
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

const pureComponent = pure(withBreakpoint(RouteScheduleContainer));
const containerComponent = createFragmentContainer(pureComponent, {
  pattern: graphql`
    fragment RouteScheduleContainer_pattern on Pattern
    @argumentDefinitions(
      serviceDay: { type: "String!", defaultValue: "19700101" }
    ) {
      code
      stops {
        id
        name
      }
      route {
        url
        gtfsId
        shortName
        longName
        mode
        type
        patterns {
          headsign
          code
          stops {
            id
            gtfsId
            code
            name
          }
          trips: tripsForDate(serviceDate: $date) {
            stoptimes: stoptimesForDate(serviceDate: $date) {
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
      tripsForDate(serviceDate: $serviceDay) {
        id
        stoptimes: stoptimesForDate(serviceDate: $serviceDay) {
          realtimeState
          scheduledArrival
          scheduledDeparture
          serviceDay
          stop {
            id
          }
        }
      }
    }
  `,
  firstDepartures: graphql`
    fragment RouteScheduleContainer_firstDepartures on Pattern
    @argumentDefinitions(
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
    }
  `,
});

export { containerComponent as default, RouteScheduleContainer as Component };
