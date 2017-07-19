import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import padStart from 'lodash/padStart';
import FilterTimeTableModal from './FilterTimeTableModal';
import TimeTableOptionsPanel from './TimeTableOptionsPanel';
import TimetableRow from './TimetableRow';
import StopPageActionBar from './StopPageActionBar';
import ComponentUsageExample from './ComponentUsageExample';

class Timetable extends React.Component {
  static propTypes = {
    stop: PropTypes.shape({
      url: PropTypes.string,
      gtfsId: PropTypes.string,
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
              scheduledDeparture: PropTypes.number.isRequired,
              serviceDay: PropTypes.number.isRequired,
            }),
          ).isRequired,
        }),
      ).isRequired,
    }).isRequired,
    propsForStopPageActionBar: PropTypes.shape({
      printUrl: PropTypes.string.isRequired,
      startDate: PropTypes.string,
      selectedDate: PropTypes.string,
      onDateChange: PropTypes.function,
    }).isRequired,
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
          name:
            stoptime.pattern.route.shortName ||
            stoptime.pattern.route.agency.name,
          scheduledDeparture: st.scheduledDeparture,
          serviceDay: st.serviceDay,
        })),
      )
      .reduce((acc, val) => acc.concat(val), []);

  groupArrayByHour = stoptimesArray =>
    groupBy(stoptimesArray, stoptime =>
      Math.floor(stoptime.scheduledDeparture / (60 * 60)),
    );

  render() {
    const timetableMap = this.groupArrayByHour(
      this.mapStopTimes(this.props.stop.stoptimesForServiceDate),
    );

    return (
      <div
        style={{
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: '1',
        }}
      >
        <div
          className="timetable"
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100%',
            flexGrow: '1',
          }}
        >
          {this.state.showFilterModal === true
            ? <FilterTimeTableModal
                stop={this.props.stop}
                setRoutes={this.setRouteVisibilityState}
                showFilterModal={this.showModal}
                showRoutesList={this.state.showRoutes}
              />
            : null}
          <div className="timetable-topbar">
            <TimeTableOptionsPanel
              showRoutes={this.state.showRoutes}
              showFilterModal={this.showModal}
              stop={this.props.stop}
            />
            <StopPageActionBar
              printUrl={this.props.propsForStopPageActionBar.printUrl}
              startDate={this.props.propsForStopPageActionBar.startDate}
              selectedDate={this.props.propsForStopPageActionBar.selectedDate}
              onDateChange={this.props.propsForStopPageActionBar.onDateChange}
            />
          </div>
          <div className="momentum-scroll" style={{ flex: '1' }}>
            {Object.keys(timetableMap)
              .sort((a, b) => a - b)
              .map(hour =>
                <TimetableRow
                  key={hour}
                  title={padStart(hour % 24, 2, '0')}
                  stoptimes={timetableMap[hour]}
                  showRoutes={this.state.showRoutes}
                  timerows={timetableMap[hour]
                    .sort(
                      (time1, time2) =>
                        time1.scheduledDeparture - time2.scheduledDeparture,
                    )
                    .map(
                      time =>
                        this.state.showRoutes.filter(
                          o => o === time.name || o === time.id,
                        ).length > 0 &&
                        moment
                          .unix(time.serviceDay + time.scheduledDeparture)
                          .format('HH'),
                    )
                    .filter(o => o === padStart(hour % 24, 2, '0'))}
                />,
              )}
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

Timetable.description = () =>
  <div>
    <p>Renders a timetable</p>
    <ComponentUsageExample description="">
      <Timetable
        stop={exampleStop}
        propsForStopPageActionBar={{ printUrl: 'http://www.hsl.fi' }}
      />
    </ComponentUsageExample>
  </div>;

export default Timetable;
