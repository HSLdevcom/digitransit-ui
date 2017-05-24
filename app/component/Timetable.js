import React, { PropTypes } from 'react';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import TimetableRow from './TimetableRow';
import ComponentUsageExample from './ComponentUsageExample';



function mapStopTimes(stoptimesObject) {
  return stoptimesObject.map((stoptime) => {
    return stoptime.stoptimes.map((st) => {return{shortName: stoptime.pattern.route.shortName, scheduledDeparture: st.scheduledDeparture, serviceDay: st.serviceDay}});
  }).reduce((acc,val)=> acc.concat(val),[]);
}

function groupArrayByHour(stoptimesArray) {
  return groupBy(stoptimesArray, (stoptime) => {
    return moment.unix(stoptime.serviceDay + stoptime.scheduledDeparture).format('HH');
  });
}

class Timetable extends React.Component {
  render() {
    const timetableMap = groupArrayByHour(mapStopTimes(this.props.stop.stoptimesForServiceDate));
    return (
      <div className="timetable">
        {Object.keys(timetableMap).sort().map(hour =>
          <TimetableRow
           key={hour}
           title={hour}
           stoptimes={timetableMap[hour]}
         />
        )}
      </div>
    );
  }
}
Timetable.displayName = 'Timetable';
const exampleStop = {
  "stoptimesForServiceDate": [{
    "pattern": {
      "route": {
        "shortName": "787K"
      }
    },
    "stoptimes": [{
      "scheduledDeparture": 60180,
      "serviceDay": 1495659600,
    }]
  }]
};

Timetable.description = () =>
  <div>
    <p>Renders a timetable</p>
    <ComponentUsageExample description="">
      <Timetable stop={exampleStop} />
    </ComponentUsageExample>
  </div>;

Timetable.propTypes = {
  stop: PropTypes.shape({
    stoptimesForServiceDate: PropTypes.arrayOf(PropTypes.shape({
      pattern: PropTypes.shape({
        route: PropTypes.shape({
          shortName: PropTypes.string.isRequired
        }).isRequired
      }).isRequired,
      stoptimes: PropTypes.arrayOf(PropTypes.shape({
        scheduledDeparture: PropTypes.number.isRequired,
        serviceDay: PropTypes.number.isRequired
      })).isRequired
    })).isRequired
  }).isRequired
};

export default Timetable;
