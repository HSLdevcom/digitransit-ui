import { createFragmentContainer, graphql } from 'react-relay/compat';

import Timetable from './Timetable';

export default createFragmentContainer(Timetable, {
  stop: graphql.experimental`
    fragment TimetableContainer_stop on Stop
      @argumentDefinitions(date: { type: "String" }) {
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
