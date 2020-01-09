/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint no-bitwise: ["error", { "allow": [">>"] }] */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { intlShape } from 'react-intl'; // DT-2531
import { routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import {
  routePatterns as exampleRoutePatterns,
  twoRoutePatterns as exampleTwoRoutePatterns,
} from './ExampleData';
import { PREFIX_ROUTES } from '../util/path';

const DATE_FORMAT = 'YYYYMMDD';
// const DATE_FORMAT2 = 'dd D.M.'; // DT-2531
const DATE_FORMAT3 = 'D.M.'; // DT-2531
const DATE_FORMAT4 = 'D.'; // DT-2531

class RoutePatternSelect extends Component {
  static propTypes = {
    params: PropTypes.object,
    className: PropTypes.string,
    route: PropTypes.object,
    onSelectChange: PropTypes.func.isRequired,
    serviceDay: PropTypes.string.isRequired,
    relay: PropTypes.object.isRequired,
    gtfsId: PropTypes.string.isRequired,
    useCurrentTime: PropTypes.bool, // DT-3182
  };

  static contextTypes = {
    intl: intlShape.isRequired, // DT-2531
    router: routerShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.props.relay.setVariables({ serviceDay: this.props.serviceDay });
    this.state = {
      loading: false,
    };
  }

  componentWillMount = () => {
    const options = this.getOptions();
    if (options === null) {
      this.setState({ loading: true });
    }
  };

  getWeekdayText = (str, arr) => {
    let weekdayText = '-';
    switch (Array.from(new Set(arr)).length) {
      case 1:
        switch (arr[0]) {
          case '1':
            weekdayText = 'ma-ma';
            break;
          case '2':
            weekdayText = 'ti-ti';
            break;
          case '3':
            weekdayText = 'ke-ke';
            break;
          case '4':
            weekdayText = 'to-to';
            break;
          case '5':
            weekdayText = 'pe-pe';
            break;
          case '6':
            weekdayText = 'la-la';
            break;
          case '7':
            weekdayText = 'su-su';
            break;
          default:
            weekdayText = '';
        }
        break;
      case 2:
        if (str.indexOf('56') !== -1) {
          weekdayText = 'pe-la';
          break;
        } else if (str.indexOf('67') !== -1) {
          weekdayText = 'la-su';
          break;
        }
        break;
      case 3:
        if (str.indexOf('567') !== -1) {
          weekdayText = 'pe-su';
          break;
        }
        break;
      case 5:
        if (str.indexOf('12345') !== -1) {
          weekdayText = 'ma-pe';
          break;
        }
        break;
      case 6:
        if (str.indexOf('123456') !== -1) {
          weekdayText = 'ma-la';
          break;
        }
        break;
      case 7:
        if (str.indexOf('1234567') !== -1) {
          weekdayText = 'ma-su';
          break;
        }
        break;
      default:
        weekdayText = '';
    }
    return weekdayText;
  };

  getOptions = () => {
    const { gtfsId, params, route, useCurrentTime } = this.props; // DT-3182: added useCurrentTime
    const { router } = this.context;
    const { patterns } = route;

    if (patterns.length === 0) {
      return null;
    }

    let futureTrips = cloneDeep(patterns);

    if (useCurrentTime === true) {
      // DT-3182
      const wantedTime = new Date().getTime();
      futureTrips.forEach(function(o) {
        if (o.tripsForDate !== undefined) {
          o.tripsForDate.forEach(function(t) {
            if (t.stoptimes !== undefined) {
              t.stoptimes = t.stoptimes.filter(
                s => (s.serviceDay + s.scheduledDeparture) * 1000 >= wantedTime,
              );
            }
          });
        }
      });
    }

    // DT-2531: remove duplicates and sort by day ascending and removing past dates
    const itineraryFutureDays = get(this.context, 'config.itineraryFutureDays');
    const currentDate = moment();
    const lastRangeDate = moment().add(
      itineraryFutureDays === undefined ? 30 : itineraryFutureDays,
      'days',
    );

    futureTrips.forEach(function(x) {
      if (x.tripsForDate !== undefined) {
        x.tripsForDate = x.tripsForDate.filter(s => s.stoptimes.length > 0);
      } else {
        x.tripsForDate = [];
      }
      const uniqueDates = [];
      if (x.activeDates !== undefined) {
        x.activeDates.forEach(function(a) {
          a.day.forEach(function(b) {
            uniqueDates.push(b);
          });
        });
      } else {
        x.activeDates = [];
      }
      x.activeDates = Array.from(new Set(uniqueDates.sort()));
    });

    for (let y = 0; y < futureTrips.length; y++) {
      const actDates = [];
      const dayNumbers = [];
      const minAndMaxDate = [];
      const dayDiff = [];
      const rangeFollowingDays = [];
      futureTrips[y].activeDates.forEach(function diffBetween(
        item,
        index,
        arr,
      ) {
        if (!actDates.includes[item]) {
          actDates.push(item);
        }
        const itemDate = moment(Number(arr[index]), DATE_FORMAT);
        if (index === 0) {
          dayDiff.push(0);
          rangeFollowingDays.push([Number(itemDate.format(DATE_FORMAT)), 0]);
          minAndMaxDate[0] = Number(itemDate.format(DATE_FORMAT));
          minAndMaxDate[1] = Number(itemDate.format(DATE_FORMAT));
        } else {
          if (Number(itemDate.format(DATE_FORMAT) < minAndMaxDate[0])) {
            minAndMaxDate[0] = Number(itemDate.format(DATE_FORMAT));
          }
          if (Number(itemDate.format(DATE_FORMAT) > minAndMaxDate[1])) {
            minAndMaxDate[1] = Number(itemDate.format(DATE_FORMAT));
          }
        }

        dayNumbers.push(moment(Number(arr[index]), DATE_FORMAT).format('E'));
        if (arr[index + 1]) {
          const diff = moment(Number(arr[index + 1]), DATE_FORMAT).diff(
            moment(Number(arr[index]), DATE_FORMAT),
            'days',
          );
          if (diff !== 1) {
            rangeFollowingDays[rangeFollowingDays.length - 1][1] = arr[index];
            rangeFollowingDays.push([arr[index + 1], 0]);
          }
          dayDiff.push(diff);
        }

        if (index + 1 === dayDiff.length && dayDiff[index] === 1) {
          rangeFollowingDays[rangeFollowingDays.length - 1][1] = arr[index];
        }
      });
      futureTrips[y].rangeFollowingDays = rangeFollowingDays;
      futureTrips[y].dayDiff = dayDiff;
      futureTrips[y].dayNumbers = dayNumbers;
      futureTrips[y].fromDate = moment(minAndMaxDate[0], 'YYYYMMDD').isAfter(
        currentDate,
      )
        ? `${minAndMaxDate[0]}`
        : '-';
      futureTrips[y].untilDate = moment(minAndMaxDate[1], 'YYYYMMDD').isBefore(
        lastRangeDate,
      )
        ? `${minAndMaxDate[1]}`
        : '-';
      futureTrips[y].activeDates = Array.from(new Set(actDates));
      futureTrips[y].dayJoin = dayNumbers.join('');
      futureTrips[y].dayString = this.getWeekdayText(
        futureTrips[y].dayJoin,
        Array.from(new Set(futureTrips[y].dayNumbers.sort())),
      );
    }

    futureTrips = futureTrips.filter(
      f => f.tripsForDate.length > 0 || f.activeDates.length > 0,
    );

    // DT-2531: shows main routes (both directions)
    if (futureTrips.length === 0 && patterns.length > 0) {
      futureTrips = patterns.filter(p => p.code.endsWith(':01'));
    }

    if (futureTrips.length === 0) {
      return null;
    }

    // DT-3182: added sortBy 'tripsForDate.length' (reverse() = descending)
    // DT-2531: added sortBy 'activeDates.length'
    const options = sortBy(
      sortBy(
        sortBy(sortBy(futureTrips, 'code').reverse(), 'activeDates.length'),
        'activeDates[0]',
      ).reverse(),
      'tripsForDate.length',
    )
      .reverse()
      .map(pattern => {
        // DT-2531 changed to correct variable (maybe confusing with variable 'patterns')
        if (futureTrips.length === 2) {
          return (
            <div
              key={pattern.code}
              value={pattern.code}
              className="route-option-togglable"
            >
              {pattern.stops[0].name} ➔ {pattern.headsign}
              {pattern.dayString !== 'ma-su'
                ? this.context.intl.formatMessage({
                    id: `route-pattern-select.range.${pattern.dayString}`,
                  })
                : ''}
            </div>
          );
        }

        // DT-2531 show activeDate(s) on option texts
        if (
          pattern.tripsForDate.length === 0 &&
          pattern.activeDates.length > 0 &&
          pattern.rangeFollowingDays.length === 1 &&
          pattern.fromDate !== '-'
        ) {
          return (
            <option key={pattern.code} value={pattern.code}>
              {pattern.stops[0].name} ➔ {pattern.headsign} ({pattern.activeDates
                .length === 1 && pattern.rangeFollowingDays[0][1] === 0
                ? this.context.intl.formatMessage({
                    id: 'route-pattern-select.only',
                  })
                : ''}
              {moment(pattern.rangeFollowingDays[0][0], DATE_FORMAT).format(
                pattern.rangeFollowingDays[0][1] === 0
                  ? DATE_FORMAT3
                  : (pattern.rangeFollowingDays[0][0] / 100) >> 0 ===
                    (pattern.rangeFollowingDays[0][1] / 100) >> 0
                    ? DATE_FORMAT4
                    : DATE_FORMAT3,
              )}
              {pattern.activeDates.length > 1 &&
              pattern.rangeFollowingDays[0][1] !== 0
                ? '-'.concat(
                    moment(
                      pattern.rangeFollowingDays[0][1],
                      DATE_FORMAT,
                    ).format(DATE_FORMAT3),
                  )
                : ''}
              )
            </option>
          );
        }

        if (
          pattern.tripsForDate.length === 0 &&
          pattern.activeDates.length > 0 &&
          pattern.rangeFollowingDays.length > 1 &&
          pattern.dayString === '-'
        ) {
          return (
            <option key={pattern.code} value={pattern.code}>
              {pattern.stops[0].name} ➔ {pattern.headsign} ({moment(
                pattern.rangeFollowingDays[0][0],
                DATE_FORMAT,
              ).format(
                pattern.rangeFollowingDays[0][0] !==
                  pattern.rangeFollowingDays[0][1] &&
                (pattern.rangeFollowingDays[0][0] / 100) >> 0 ===
                  (pattern.rangeFollowingDays[0][1] / 100) >> 0
                  ? DATE_FORMAT4
                  : DATE_FORMAT3,
              )}
              {pattern.rangeFollowingDays[0][1] !==
              pattern.rangeFollowingDays[0][0]
                ? '-'.concat(
                    moment(
                      pattern.rangeFollowingDays[0][1],
                      DATE_FORMAT,
                    ).format(DATE_FORMAT3),
                  )
                : ''}
              {', '.concat(
                moment(pattern.rangeFollowingDays[1][0], DATE_FORMAT).format(
                  pattern.rangeFollowingDays[1][0] !==
                    pattern.rangeFollowingDays[1][1] &&
                  (pattern.rangeFollowingDays[1][0] / 100) >> 0 ===
                    (pattern.rangeFollowingDays[1][1] / 100) >> 0
                    ? DATE_FORMAT4
                    : DATE_FORMAT3,
                ),
              )}
              {pattern.rangeFollowingDays[1][1] !==
              pattern.rangeFollowingDays[1][0]
                ? '-'.concat(
                    moment(
                      pattern.rangeFollowingDays[1][1],
                      DATE_FORMAT,
                    ).format(DATE_FORMAT3),
                  )
                : ''}
              {pattern.rangeFollowingDays.length > 2
                ? ', '.concat(
                    moment(
                      pattern.rangeFollowingDays[2][0],
                      DATE_FORMAT,
                    ).format(
                      pattern.rangeFollowingDays[2][0] !==
                        pattern.rangeFollowingDays[2][1] &&
                      (pattern.rangeFollowingDays[2][0] / 100) >> 0 ===
                        (pattern.rangeFollowingDays[2][1] / 100) >> 0 &&
                      moment(lastRangeDate, DATE_FORMAT).isAfter(
                        moment(pattern.rangeFollowingDays[2][1], DATE_FORMAT),
                      )
                        ? DATE_FORMAT4
                        : DATE_FORMAT3,
                    ),
                  )
                : ''}
              {pattern.rangeFollowingDays.length > 2 &&
              pattern.rangeFollowingDays[2][1] !==
                pattern.rangeFollowingDays[2][0]
                ? '-'.concat(
                    moment(lastRangeDate, DATE_FORMAT).isAfter(
                      moment(pattern.rangeFollowingDays[2][1], DATE_FORMAT),
                    ) || pattern.rangeFollowingDays.length > 3
                      ? moment(
                          pattern.rangeFollowingDays[2][1],
                          DATE_FORMAT,
                        ).format(DATE_FORMAT3)
                      : '',
                  )
                : ''}
              {pattern.rangeFollowingDays.length > 3 ? ', ...' : ''}
              )
            </option>
          );
        }
        return (
          <option key={pattern.code} value={pattern.code}>
            {pattern.stops[0].name} ➔ {pattern.headsign}
            {pattern.untilDate !== '-'
              ? this.context.intl
                  .formatMessage(
                    {
                      id: 'route-pattern-select.until',
                    },
                    {
                      range:
                        pattern.dayString === 'ma-su'
                          ? this.context.intl
                              .formatMessage({
                                id: `route-pattern-select.range.${
                                  pattern.dayString
                                }`,
                              })
                              .replace(/\(|\)| /gi, '')
                          : this.context.intl
                              .formatMessage({
                                id: `route-pattern-select.range.${
                                  pattern.dayString
                                }`,
                              })
                              .replace(/\(|\)/gi, ''),
                      day: moment(pattern.untilDate, DATE_FORMAT).format(
                        DATE_FORMAT3,
                      ),
                    },
                  )
                  .replace(/\( /gi, '(')
              : ''}
            {pattern.fromDate !== '-'
              ? this.context.intl
                  .formatMessage(
                    {
                      id: 'route-pattern-select.from',
                    },
                    {
                      range:
                        pattern.dayString === 'ma-su'
                          ? this.context.intl
                              .formatMessage({
                                id: `route-pattern-select.range.${
                                  pattern.dayString
                                }`,
                              })
                              .replace(/\(|\)| /gi, '')
                          : this.context.intl
                              .formatMessage({
                                id: `route-pattern-select.range.${
                                  pattern.dayString
                                }`,
                              })
                              .replace(/\(|\)/gi, ''),
                      day: moment(pattern.fromDate, DATE_FORMAT).format(
                        DATE_FORMAT3,
                      ),
                    },
                  )
                  .replace(/\( /gi, '(')
              : ''}
            {pattern.untilDate === '-' && pattern.fromDate === '-'
              ? pattern.dayString === 'ma-su'
                ? this.context.intl
                    .formatMessage({
                      id: `route-pattern-select.range.${pattern.dayString}`,
                    })
                    .replace(/\(|\)| /gi, '')
                : this.context.intl.formatMessage({
                    id: `route-pattern-select.range.${pattern.dayString}`,
                  })
              : ''}
          </option>
        );
      });

    if (options.every(o => o.key !== params.patternId)) {
      router.replace(`/${PREFIX_ROUTES}/${gtfsId}/pysakit/${options[0].key}`);
    } else if (options.length > 0 && this.state.loading === true) {
      this.setState({ loading: false });
    }
    return options;
  };

  render() {
    const options = this.getOptions();
    return this.state.loading === true ? (
      <div className={cx('route-pattern-select', this.props.className)} />
    ) : (
      <div className={cx('route-pattern-select', this.props.className)}>
        {options && (options.length > 2 || options.length === 1) ? (
          <React.Fragment>
            <Icon img="icon-icon_arrow-dropdown" />
            <select
              id="select-route-pattern"
              onChange={e => this.props.onSelectChange(e.target.value)}
              value={this.props.params && this.props.params.patternId}
            >
              {options}
            </select>
          </React.Fragment>
        ) : (
          <div className="route-patterns-toggle">
            <div
              className="route-option"
              role="button"
              tabIndex={0}
              onKeyPress={() =>
                this.props.onSelectChange(
                  options.find(
                    o => o.props.value !== this.props.params.patternId,
                  ).props.value,
                )
              }
              onClick={() =>
                this.props.onSelectChange(
                  options.find(
                    o => o.props.value !== this.props.params.patternId,
                  ).props.value,
                )
              }
            >
              {options &&
                options.filter(
                  o => o.props.value === this.props.params.patternId,
                )[0]}
            </div>

            <button
              type="button"
              className="toggle-direction"
              onClick={() =>
                this.props.onSelectChange(
                  options.find(
                    o => o.props.value !== this.props.params.patternId,
                  ).props.value,
                )
              }
            >
              <Icon img="icon-icon_direction-b" />
            </button>
          </div>
        )}
      </div>
    );
  }
}

const defaultProps = {
  className: 'bp-large',
  serviceDay: '20190306',
  relay: {
    setVariables: () => {},
  },
  params: {
    routeId: 'HSL:1010',
    patternId: 'HSL:1010:0:01',
  },
};

RoutePatternSelect.description = () => (
  <div>
    <p>Display a dropdown to select the pattern for a route</p>
    <ComponentUsageExample>
      <RoutePatternSelect route={exampleRoutePatterns} {...defaultProps} />
    </ComponentUsageExample>
    <ComponentUsageExample>
      <RoutePatternSelect route={exampleTwoRoutePatterns} {...defaultProps} />
    </ComponentUsageExample>
  </div>
);

// DT-2531: added activeDates
const withStore = connectToStores(
  Relay.createContainer(RoutePatternSelect, {
    initialVariables: {
      serviceDay: moment().format(DATE_FORMAT),
    },
    fragments: {
      route: () => Relay.QL`
      fragment on Route {
        patterns {
          code
          headsign
          stops {
            name
          }
          tripsForDate(serviceDate: $serviceDay) {
            id
            stoptimes: stoptimesForDate(serviceDate: $serviceDay) {
              scheduledArrival
              scheduledDeparture
              serviceDay
              stop {
                id
              }
            }
          }
          activeDates: trips {
            day: activeDates
          }
        }
      }
      `,
    },
  }),
  [],
  context => ({
    serviceDay: context
      .getStore('TimeStore')
      .getCurrentTime()
      .format(DATE_FORMAT),
  }),
);

export { withStore as default, RoutePatternSelect as Component };
