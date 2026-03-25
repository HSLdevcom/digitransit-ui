import { graphql } from 'react-relay';

export const ScheduleFirstDeparturesFragment = graphql`
  fragment ScheduleFirstDeparturesFragment on Pattern
  @argumentDefinitions(
    showTenWeeks: { type: "Boolean!", defaultValue: false }
    wk1day1: { type: "String!", defaultValue: "19700101" }
    wk1day2: { type: "String!", defaultValue: "19700101" }
    wk1day3: { type: "String!", defaultValue: "19700101" }
    wk1day4: { type: "String!", defaultValue: "19700101" }
    wk1day5: { type: "String!", defaultValue: "19700101" }
    wk1day6: { type: "String!", defaultValue: "19700101" }
    wk1day7: { type: "String!", defaultValue: "19700101" }
    wk2day1: { type: "String!", defaultValue: "19700101" }
    wk2day2: { type: "String!", defaultValue: "19700101" }
    wk2day3: { type: "String!", defaultValue: "19700101" }
    wk2day4: { type: "String!", defaultValue: "19700101" }
    wk2day5: { type: "String!", defaultValue: "19700101" }
    wk2day6: { type: "String!", defaultValue: "19700101" }
    wk2day7: { type: "String!", defaultValue: "19700101" }
    wk3day1: { type: "String!", defaultValue: "19700101" }
    wk3day2: { type: "String!", defaultValue: "19700101" }
    wk3day3: { type: "String!", defaultValue: "19700101" }
    wk3day4: { type: "String!", defaultValue: "19700101" }
    wk3day5: { type: "String!", defaultValue: "19700101" }
    wk3day6: { type: "String!", defaultValue: "19700101" }
    wk3day7: { type: "String!", defaultValue: "19700101" }
    wk4day1: { type: "String!", defaultValue: "19700101" }
    wk4day2: { type: "String!", defaultValue: "19700101" }
    wk4day3: { type: "String!", defaultValue: "19700101" }
    wk4day4: { type: "String!", defaultValue: "19700101" }
    wk4day5: { type: "String!", defaultValue: "19700101" }
    wk4day6: { type: "String!", defaultValue: "19700101" }
    wk4day7: { type: "String!", defaultValue: "19700101" }
    wk5day1: { type: "String!", defaultValue: "19700101" }
    wk5day2: { type: "String!", defaultValue: "19700101" }
    wk5day3: { type: "String!", defaultValue: "19700101" }
    wk5day4: { type: "String!", defaultValue: "19700101" }
    wk5day5: { type: "String!", defaultValue: "19700101" }
    wk5day6: { type: "String!", defaultValue: "19700101" }
    wk5day7: { type: "String!", defaultValue: "19700101" }
    wk6day1: { type: "String" }
    wk6day2: { type: "String" }
    wk6day3: { type: "String" }
    wk6day4: { type: "String" }
    wk6day5: { type: "String" }
    wk6day6: { type: "String" }
    wk6day7: { type: "String" }
    wk7day1: { type: "String" }
    wk7day2: { type: "String" }
    wk7day3: { type: "String" }
    wk7day4: { type: "String" }
    wk7day5: { type: "String" }
    wk7day6: { type: "String" }
    wk7day7: { type: "String" }
    wk8day1: { type: "String" }
    wk8day2: { type: "String" }
    wk8day3: { type: "String" }
    wk8day4: { type: "String" }
    wk8day5: { type: "String" }
    wk8day6: { type: "String" }
    wk8day7: { type: "String" }
    wk9day1: { type: "String" }
    wk9day2: { type: "String" }
    wk9day3: { type: "String" }
    wk9day4: { type: "String" }
    wk9day5: { type: "String" }
    wk9day6: { type: "String" }
    wk9day7: { type: "String" }
    wk10day1: { type: "String" }
    wk10day2: { type: "String" }
    wk10day3: { type: "String" }
    wk10day4: { type: "String" }
    wk10day5: { type: "String" }
    wk10day6: { type: "String" }
    wk10day7: { type: "String" }
  ) {
    wk1mon: tripsForDate(serviceDate: $wk1day1) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk1tue: tripsForDate(serviceDate: $wk1day2) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk1wed: tripsForDate(serviceDate: $wk1day3) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk1thu: tripsForDate(serviceDate: $wk1day4) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk1fri: tripsForDate(serviceDate: $wk1day5) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk1sat: tripsForDate(serviceDate: $wk1day6) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk1sun: tripsForDate(serviceDate: $wk1day7) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk2mon: tripsForDate(serviceDate: $wk2day1) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk2tue: tripsForDate(serviceDate: $wk2day2) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk2wed: tripsForDate(serviceDate: $wk2day3) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk2thu: tripsForDate(serviceDate: $wk2day4) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk2fri: tripsForDate(serviceDate: $wk2day5) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk2sat: tripsForDate(serviceDate: $wk2day6) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk2sun: tripsForDate(serviceDate: $wk2day7) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk3mon: tripsForDate(serviceDate: $wk3day1) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk3tue: tripsForDate(serviceDate: $wk3day2) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk3wed: tripsForDate(serviceDate: $wk3day3) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk3thu: tripsForDate(serviceDate: $wk3day4) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk3fri: tripsForDate(serviceDate: $wk3day5) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk3sat: tripsForDate(serviceDate: $wk3day6) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk3sun: tripsForDate(serviceDate: $wk3day7) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk4mon: tripsForDate(serviceDate: $wk4day1) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk4tue: tripsForDate(serviceDate: $wk4day2) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk4wed: tripsForDate(serviceDate: $wk4day3) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk4thu: tripsForDate(serviceDate: $wk4day4) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk4fri: tripsForDate(serviceDate: $wk4day5) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk4sat: tripsForDate(serviceDate: $wk4day6) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk4sun: tripsForDate(serviceDate: $wk4day7) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk5mon: tripsForDate(serviceDate: $wk5day1) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk5tue: tripsForDate(serviceDate: $wk5day2) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk5wed: tripsForDate(serviceDate: $wk5day3) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk5thu: tripsForDate(serviceDate: $wk5day4) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk5fri: tripsForDate(serviceDate: $wk5day5) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk5sat: tripsForDate(serviceDate: $wk5day6) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk5sun: tripsForDate(serviceDate: $wk5day7) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk6mon: tripsForDate(serviceDate: $wk6day1) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk6tue: tripsForDate(serviceDate: $wk6day2) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk6wed: tripsForDate(serviceDate: $wk6day3) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk6thu: tripsForDate(serviceDate: $wk6day4) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk6fri: tripsForDate(serviceDate: $wk6day5) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk6sat: tripsForDate(serviceDate: $wk6day6) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk6sun: tripsForDate(serviceDate: $wk6day7) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk7mon: tripsForDate(serviceDate: $wk7day1) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk7tue: tripsForDate(serviceDate: $wk7day2) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk7wed: tripsForDate(serviceDate: $wk7day3) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk7thu: tripsForDate(serviceDate: $wk7day4) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk7fri: tripsForDate(serviceDate: $wk7day5) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk7sat: tripsForDate(serviceDate: $wk7day6) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk7sun: tripsForDate(serviceDate: $wk7day7) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk8mon: tripsForDate(serviceDate: $wk8day1) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk8tue: tripsForDate(serviceDate: $wk8day2) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk8wed: tripsForDate(serviceDate: $wk8day3) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk8thu: tripsForDate(serviceDate: $wk8day4) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk8fri: tripsForDate(serviceDate: $wk8day5) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk8sat: tripsForDate(serviceDate: $wk8day6) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk8sun: tripsForDate(serviceDate: $wk8day7) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk9mon: tripsForDate(serviceDate: $wk9day1) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk9tue: tripsForDate(serviceDate: $wk9day2) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk9wed: tripsForDate(serviceDate: $wk9day3) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk9thu: tripsForDate(serviceDate: $wk9day4) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk9fri: tripsForDate(serviceDate: $wk9day5) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk9sat: tripsForDate(serviceDate: $wk9day6) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk9sun: tripsForDate(serviceDate: $wk9day7) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk10mon: tripsForDate(serviceDate: $wk10day1) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk10tue: tripsForDate(serviceDate: $wk10day2) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk10wed: tripsForDate(serviceDate: $wk10day3) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk10thu: tripsForDate(serviceDate: $wk10day4) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk10fri: tripsForDate(serviceDate: $wk10day5) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk10sat: tripsForDate(serviceDate: $wk10day6) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
    wk10sun: tripsForDate(serviceDate: $wk10day7) @include(if: $showTenWeeks) {
      departureStoptime {
        scheduledDeparture
      }
    }
  }
`;
