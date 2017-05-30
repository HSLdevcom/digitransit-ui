import Relay from 'react-relay';
import moment from 'moment';

import Timetable from './Timetable';

const date = moment().format('YYYYMMDD');

export default Relay.createContainer(Timetable, {
  fragments: {
    stop: () => Relay.QL`
      fragment Timetable on Stop {
        name
        stoptimesForServiceDate(date:$date) {
          pattern {
            headsign
            route {
              shortName
              agency {
                id
                name
              }
            }
          }
          stoptimes {
            scheduledDeparture
            serviceDay
            headsign
          }
        }
      }
    `,
  },
  initialVariables: { date },
});
