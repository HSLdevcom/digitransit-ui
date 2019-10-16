import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import padStart from 'lodash/padStart';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import StopPageActionBar from './StopPageActionBar';
import FilterTimeTableModal from './FilterTimeTableModal';
import TimeTableOptionsPanel from './TimeTableOptionsPanel';
import TimetableRow from './TimetableRow';
import ComponentUsageExample from './ComponentUsageExample';
import { RealtimeStateType } from '../constants';

class Timetable extends React.Component {
  static propTypes = {
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
      ).isRequired,
    }).isRequired,
    propsForStopPageActionBar: PropTypes.shape({
      startDate: PropTypes.string,
      selectedDate: PropTypes.string,
      onDateChange: PropTypes.func,
    }).isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.setRouteVisibilityState = this.setRouteVisibilityState.bind(this);
    this.state = {
      showRoutes: [],
      showFilterModal: false,
      oldStopId: this.props.stop.gtfsId,
    };
  }

  componentWillReceiveProps = () => {
    if (this.props.stop.gtfsId !== this.state.oldStopId) {
      this.resetStopOptions(this.props.stop.gtfsId);
    }
  };

  getDuplicatedRoutes = () => {
    const routesToCheck = this.mapStopTimes(
      this.props.stop.stoptimesForServiceDate,
    )
      .map(o => {
        const obj = {};
        obj.shortName = o.name;
        obj.headsign = o.headsign;
        return obj;
      })
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            o => o.headsign === item.headsign && o.shortName === item.shortName,
          ),
      );

    const routesWithDupes = [];
    Object.entries(groupBy(routesToCheck, 'shortName')).forEach(
      ([key, value]) =>
        value.length > 1 ? routesWithDupes.push(key) : undefined,
    );

    return routesWithDupes;
  };

  setRouteVisibilityState = val => {
    this.setState({ showRoutes: val.showRoutes });
  };

  resetStopOptions = id => {
    this.setState({ showRoutes: [], showFilterModal: false, oldStopId: id });
  };

  showModal = val => {
    this.setState({ showFilterModal: val });
  };

  mapStopTimes = stoptimesObject =>
    stoptimesObject
      .map(stoptime =>
        stoptime.stoptimes.filter(st => st.pickupType !== 'NONE').map(st => ({
          id: stoptime.pattern.code,
          name: stoptime.pattern.route.shortName || stoptime.pattern.headsign,
          scheduledDeparture: st.scheduledDeparture,
          serviceDay: st.serviceDay,
          headsign: stoptime.pattern.headsign,
          longName: stoptime.pattern.route.longName,
          isCanceled: st.realtimeState === RealtimeStateType.Canceled,
        })),
      )
      .reduce((acc, val) => acc.concat(val), []);

  groupArrayByHour = stoptimesArray =>
    groupBy(stoptimesArray, stoptime =>
      Math.floor(stoptime.scheduledDeparture / (60 * 60)),
    );

  dateForPrinting = () => {
    const selectedDate = moment(
      this.props.propsForStopPageActionBar.selectedDate,
    );
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

  formTimeRow = (timetableMap, hour) => {
    const sortedArr = timetableMap[hour].sort(
      (time1, time2) => time1.scheduledDeparture - time2.scheduledDeparture,
    );

    const filteredRoutes = sortedArr
      .map(
        time =>
          this.state.showRoutes.filter(o => o === time.name || o === time.id)
            .length > 0 &&
          moment.unix(time.serviceDay + time.scheduledDeparture).format('HH'),
      )
      .filter(o => o === padStart(hour % 24, 2, '0'));

    return filteredRoutes;
  };

  createTimeTableRows = timetableMap =>
    Object.keys(timetableMap)
      .sort((a, b) => a - b)
      .map(hour => (
        <TimetableRow
          key={hour}
          title={padStart(hour % 24, 2, '0')}
          stoptimes={timetableMap[hour]}
          showRoutes={this.state.showRoutes}
          timerows={this.formTimeRow(timetableMap, hour)}
        />
      ));

  render() {
    // Leave out all the routes without a shortname to avoid flooding of
    // long distance buses being falsely positived as duplicates
    // then look foor routes operating under the same number but
    // different headsigns
    const duplicateRoutes = this.getDuplicatedRoutes();
    const variantList = groupBy(
      sortBy(
        uniqBy(
          this.mapStopTimes(
            this.props.stop.stoptimesForServiceDate.filter(
              o => o.pattern.route.shortName,
            ),
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

    const routesWithDetails = this.mapStopTimes(
      this.props.stop.stoptimesForServiceDate,
    ).map(o => {
      const obj = Object.assign(o);
      const getDuplicate = variantsWithMarks.find(
        o2 => o2.name === o.name && o2.headsign === o.headsign && o2.duplicate,
      );
      obj.duplicate = getDuplicate ? getDuplicate.duplicate : false;
      return obj;
    });

    const timetableMap = this.groupArrayByHour(routesWithDetails);

    const stopIdSplitted = this.props.stop.gtfsId.split(':');
    const stopTimetableHandler =
      this.context.config.timetables &&
      this.context.config.timetables[stopIdSplitted[0]];
    const stopPDFURL =
      stopTimetableHandler &&
      this.context.config.URL.STOP_TIMETABLES[stopIdSplitted[0]] &&
      this.props.stop.locationType !== 'STATION'
        ? stopTimetableHandler.stopPdfUrlResolver(
            this.context.config.URL.STOP_TIMETABLES[stopIdSplitted[0]],
            this.props.stop,
          )
        : null;
    return (
      <div className="timetable">
        {this.state.showFilterModal === true ? (
          <FilterTimeTableModal
            stop={this.props.stop}
            setRoutes={this.setRouteVisibilityState}
            showFilterModal={this.showModal}
            showRoutesList={this.state.showRoutes}
          />
        ) : null}
        <div className="timetable-topbar">
          <TimeTableOptionsPanel
            showRoutes={this.state.showRoutes}
            showFilterModal={this.showModal}
            stop={this.props.stop}
          />
          <StopPageActionBar
            startDate={this.props.propsForStopPageActionBar.startDate}
            selectedDate={this.props.propsForStopPageActionBar.selectedDate}
            onDateChange={this.props.propsForStopPageActionBar.onDateChange}
            stopPDFURL={stopPDFURL}
          />
        </div>
        <div className="timetable-for-printing-header">
          <h1>
            <FormattedMessage id="timetable" defaultMessage="Timetable" />
          </h1>
        </div>
        <div className="timetable-for-printing">{this.dateForPrinting()}</div>
        <div className="momentum-scroll">
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
          {this.createTimeTableRows(timetableMap)}
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
              />:
            </h1>
            {variantsWithMarks.map(o => (
              <div className="remark-row" key={`${o.id}-${o.headsign}`}>
                <span>{`${o.name}${o.duplicate} = ${o.headsign}`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

Timetable.displayName = 'Timetable';
const exampleStop = {
  gtfsId: '123124234',
  name: '1231213',
  url: '1231231',
  stoptimesForServiceDate: [
    {
      pattern: {
        headsign: 'Pornainen',
        route: {
          shortName: '787K',
          agency: {
            name: 'Helsingin seudun liikenne',
          },
          mode: 'BUS',
        },
      },
      stoptimes: [
        {
          scheduledDeparture: 60180,
          serviceDay: 1495659600,
        },
      ],
    },
    {
      pattern: {
        route: {
          mode: 'BUS',
          shortName: 'Kotkan linja-autoasema',
          agency: {
            name: 'Helsingin seudun liikenne',
          },
        },
      },
      stoptimes: [
        {
          scheduledDeparture: 61180,
          serviceDay: 1495659600,
        },
      ],
    },
  ],
};

Timetable.description = () => (
  <div>
    <p>Renders a timetable</p>
    <ComponentUsageExample description="">
      <Timetable
        stop={exampleStop}
        propsForStopPageActionBar={{
          startDate: '20190110',
          selectedDate: '20190110',
          onDateChange: () => {},
        }}
      />
    </ComponentUsageExample>
  </div>
);

export default Timetable;
