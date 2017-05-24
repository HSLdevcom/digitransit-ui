import React, { PropTypes } from 'react';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import TimetableRow from './TimetableRow';



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

Timetable.propTypes = {
  stop: PropTypes.object.isRequired
};

export default Timetable;
