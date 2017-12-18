import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';

import Timetable from './Timetable';

export default createFragmentContainer(Timetable, {
  stop: graphql`
    fragment TimetableContainer_stop on Stop
      @argumentDefinitions(date: { type: "String", defaultValue: "19700101" }) {
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
