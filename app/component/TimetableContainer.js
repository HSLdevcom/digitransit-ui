import Relay from 'react-relay/classic';

import Timetable from './Timetable';

export default Relay.createContainer(Timetable, {
  fragments: {
    stop: () => Relay.QL`
      fragment Timetable on Stop {
        gtfsId
        name
        url
        locationType
        stoptimesForServiceDate(date:$date) {
          pattern {
            headsign
            code
            route {
              id
              shortName
              longName
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
  initialVariables: { date: null },
});
