import { createFragmentContainer, graphql } from 'react-relay/compat';

import Timetable from './Timetable';

export default createFragmentContainer(Timetable, {
  /* TODO manually deal with:
  initialVariables: { date: null }
  */
  stop: graphql`
    fragment TimetableContainer_stop on Stop {
      gtfsId
      name
      url
      stoptimesForServiceDate(date: $date) {
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
});
