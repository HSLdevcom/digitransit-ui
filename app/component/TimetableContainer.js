import Relay from 'react-relay';

import Timetable from './Timetable';

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
            pickupType
          }
        }
      }
    `,
  },
  initialVariables: { date: null },
});
