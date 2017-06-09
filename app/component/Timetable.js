import React, { PropTypes } from 'react';
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
      stoptimesForServiceDate: PropTypes.arrayOf(PropTypes.shape({
        pattern: PropTypes.shape({
          route: PropTypes.shape({
            shortName: PropTypes.string,
            agency: PropTypes.shape({
              name: PropTypes.string.isRequired,
            }).isRequired,
          }).isRequired,
        }).isRequired,
        stoptimes: PropTypes.arrayOf(PropTypes.shape({
          scheduledDeparture: PropTypes.number.isRequired,
          serviceDay: PropTypes.number.isRequired,
        })).isRequired,
      })).isRequired,
    }).isRequired,
    printUrl: PropTypes.string,
    propsForStpPageActionBar: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.setRouteVisibilityState = this.setRouteVisibilityState.bind(this);
    this.state = {
      showRoutes: [],
      hideAllRoutes: false,
      showFilterModal: false,
    };
  }

  setRouteVisibilityState = (val) => {
    console.log(val);
    this.setState({ showRoutes: val.showRoutes, hideAllRoutes: val.hideAllRoutes });
  }

  showModal = (val) => {
    this.setState({ showFilterModal: val });
  }

  mapStopTimes = stoptimesObject =>
    stoptimesObject.map(stoptime =>
      stoptime.stoptimes
        .filter(st => st.pickupType !== 'NONE')
        .map(st => ({
          name: stoptime.pattern.route.shortName || stoptime.pattern.route.agency.name,
          scheduledDeparture: st.scheduledDeparture,
          serviceDay: st.serviceDay,
        })),
    ).reduce((acc, val) => acc.concat(val), []);

  groupArrayByHour = stoptimesArray =>
    groupBy(stoptimesArray, stoptime =>
    Math.floor(stoptime.scheduledDeparture / (60 * 60)),
  );

  render() {
    const timetableMap = this.groupArrayByHour(
      this.mapStopTimes(this.props.stop.stoptimesForServiceDate));
    return (
      <div className="timetable">
        {this.state.showFilterModal === true ?
          <FilterTimeTableModal
            stop={this.props.stop}
            setRoutes={this.setRouteVisibilityState}
            showFilterModal={this.showModal}
            showRoutesList={this.state.showRoutes}
            hideAllRoutes={this.state.hideAllRoutes}
          /> : null}
        <TimeTableOptionsPanel
          showRoutes={this.state.showRoutes}
          showFilterModal={this.showModal}
          hideAllRoutes={this.state.hideAllRoutes}
          stop={this.props.stop}
        />
        <StopPageActionBar
          printUrl={this.props.propsForStpPageActionBar.printUrl}
          startDate={this.props.propsForStpPageActionBar.startDate}
          selectedDate={this.props.propsForStpPageActionBar.selectedDate}
          onDateChange={this.props.propsForStpPageActionBar.onDateChange}
        />
        {Object.keys(timetableMap).sort((a, b) => a - b).map(hour =>
          <TimetableRow
            key={hour}
            title={padStart(hour % 24, 2, '0')}
            stoptimes={timetableMap[hour]}
            showRoutes={this.state.showRoutes}
            hideAllRoutes={this.state.hideAllRoutes}
          />,
      )}
      </div>
    );
  }
}

Timetable.displayName = 'Timetable';
const exampleStop = {
  gtfsId: '123124234',
  name: '1231213',
  url: '1231231',
  stoptimesForServiceDate: [{
    pattern: {
      headsign: 'Pornainen',
      route: {
        shortName: '787K',
        agency: {
          name: 'Helsingin seudun liikenne',
        },
      },
    },
    stoptimes: [{
      scheduledDeparture: 60180,
      serviceDay: 1495659600,
    }],
  }, {
    pattern: {
      route: {
        agency: {
          name: 'Helsingin seudun liikenne',
        },
      },
    },
    stoptimes: [{
      scheduledDeparture: 61180,
      serviceDay: 1495659600,
    }],
  }],
};

Timetable.description = () =>
  <div>
    <p>Renders a timetable</p>
    <ComponentUsageExample description="">
      <Timetable stop={exampleStop} />
    </ComponentUsageExample>
  </div>;

export default Timetable;
