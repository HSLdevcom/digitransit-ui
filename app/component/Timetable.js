import React from 'react';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import moment from 'moment';
import TimetableRow from './TimetableRow';

const test_timetable = [{
  serviceDay:1495486800,
  scheduledArrival:42320,
  shortName: "55a"
},{
  serviceDay:1495486800,
  scheduledArrival:42420,
  shortName: "57"
},{
  serviceDay:1495486800,
  scheduledArrival:42520,
  shortName: "52"
},{
  serviceDay:1495486800,
  scheduledArrival:42620,
  shortName: "55"
},{
  serviceDay:1495486800,
  scheduledArrival:42720,
  shortName: "62"
},{
  serviceDay:1495486800,
  scheduledArrival:42820,
  shortName: "103n"
},{
  serviceDay:1495486800,
  scheduledArrival:51820,
  shortName: "57"
}];

const timetableMap = groupBy(test_timetable, (time) => {
  return moment.unix(time.serviceDay + time.scheduledArrival).format('HH');
});

class Timetable extends React.Component {
  render() {
    return (
      <div className="timetable">
        {map(timetableMap, (stoptimes,hour)=>{
          return <TimetableRow
                   key={hour}
                   title={hour}
                   stoptimes={stoptimes}
                 />
          })
        }
      </div>
    );
  }
}

Timetable.propTypes = {
};

export default Timetable;
