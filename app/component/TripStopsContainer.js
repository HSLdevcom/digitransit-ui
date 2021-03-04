import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import pure from 'recompose/pure';
import { matchShape } from 'found';
import debounce from 'lodash/debounce';

import RoutePageControlPanel from './RoutePageControlPanel';
import { getStartTime } from '../util/timeUtils';
import TripStopListContainer from './TripStopListContainer';
import withBreakpoint from '../util/withBreakpoint';

function TripStopsContainer({ breakpoint, match, trip, route }) {
  const [keepTracking, setTracking] = useState(true);
  const humanScrolling = useRef(true);

  const setHumanScrolling = boolVal => {
    humanScrolling.current = boolVal;
  };

  if (!trip) {
    return null;
  }

  const tripStartTime = getStartTime(
    trip.stoptimesForDate[0].scheduledDeparture,
  );

  const fullscreen =
    match.location.state && match.location.state.fullscreenMap === true;

  if (fullscreen && breakpoint !== 'large') {
    return <div className="route-page-content" />;
  }

  const handleScroll = () => {
    if (humanScrolling.current && keepTracking) {
      setTracking(false);
    }
  };

  return (
    <div
      className={cx(
        'route-page-content',
        'momentum-scroll',
        {
          'fullscreen-map': fullscreen && breakpoint !== 'large',
        },
        {
          'bp-large': breakpoint === 'large',
        },
      )}
      id="trip-route-page-content"
      onScroll={debounce(handleScroll, 100, { leading: true })}
    >
      {route && route.patterns && (
        <RoutePageControlPanel
          match={match}
          route={route}
          breakpoint={breakpoint}
        />
      )}
      <TripStopListContainer
        key="list"
        trip={trip}
        tripStart={tripStartTime}
        fullscreenMap={fullscreen}
        keepTracking={keepTracking}
        setHumanScrolling={setHumanScrolling}
      />
    </div>
  );
}

TripStopsContainer.propTypes = {
  trip: PropTypes.shape({
    stoptimesForDate: PropTypes.arrayOf(
      PropTypes.shape({
        scheduledDeparture: PropTypes.number.isRequired,
      }).isRequired,
    ).isRequired,
  }),
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  route: PropTypes.object,
};

TripStopsContainer.defaultProps = {
  trip: undefined,
  route: undefined,
};

const pureComponent = pure(withBreakpoint(TripStopsContainer));
const containerComponent = createFragmentContainer(pureComponent, {
  trip: graphql`
    fragment TripStopsContainer_trip on Trip {
      stoptimesForDate {
        scheduledDeparture
      }
      ...TripStopListContainer_trip
    }
  `,
  pattern: graphql`
    fragment TripStopsContainer_pattern on Pattern {
      id
    }
  `,
  route: graphql`
    fragment TripStopsContainer_route on Route
    @argumentDefinitions(date: { type: "String" }) {
      gtfsId
      color
      shortName
      longName
      mode
      type
      ...RouteAgencyInfo_route
      ...RoutePatternSelect_route @arguments(date: $date)
      alerts {
        alertSeverityLevel
        effectiveEndDate
        effectiveStartDate
        trip {
          pattern {
            code
          }
        }
      }
      agency {
        phone
      }
      patterns {
        headsign
        code
        stops {
          id
          gtfsId
          code
          alerts {
            id
            alertDescriptionText
            alertHash
            alertHeaderText
            alertSeverityLevel
            alertUrl
            effectiveEndDate
            effectiveStartDate
            alertDescriptionTextTranslations {
              language
              text
            }
            alertHeaderTextTranslations {
              language
              text
            }
            alertUrlTranslations {
              language
              text
            }
          }
        }
        trips: tripsForDate(serviceDate: $date) {
          stoptimes: stoptimesForDate(serviceDate: $date) {
            realtimeState
            scheduledArrival
            scheduledDeparture
            serviceDay
          }
        }
        activeDates: trips {
          day: activeDates
        }
      }
    }
  `,
});

export { containerComponent as default, TripStopsContainer as Component };
