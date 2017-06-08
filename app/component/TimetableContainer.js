import Relay from 'react-relay';
import moment from 'moment';

import Timetable from './Timetable';

const date = moment().format('YYYYMMDD');

export default Relay.createContainer(Timetable, {
  fragments: {
    stop: () => Relay.QL`
      fragment Timetable on Stop {
        gtfsId
        name
        url
        stoptimesForServiceDate(date:$date) {
          pattern {
            headsign
            route {
              id
              shortName
              mode
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
            pickupType
          }
        }
      }
    `,
  },
  initialVariables: { date },
});
