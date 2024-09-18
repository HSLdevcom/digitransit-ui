import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql, fetchQuery } from 'react-relay';
import { itineraryShape, relayShape } from '../../util/shapes';
import Navigator from './Navigator';
import NaviBottom from './NaviBottom';
import { legTime } from '../../util/legUtils';

const TRANSFER_SLACK = 60000; // milliseconds

const legQuery = graphql`
  query Navigator_legQuery($id: ID!) {
    node(id: $id) {
      ... on Leg {
        id
        start {
          scheduledTime
          estimated {
            time
          }
        }
        end {
          scheduledTime
          estimated {
            time
          }
        }
        realtimeState
      }
    }
  }
`;

function findTransferProblem(legs) {
  for (let i = 1; i < legs.length - 1; i++) {
    const prev = legs[i - 1];
    const leg = legs[i];
    const next = legs[i + 1];

    if (prev.transitLeg && leg.transitLeg && !leg.interlineWithPreviousLeg) {
      // transfer at a stop
      if (legTime(leg.start) - legTime(prev.end) < TRANSFER_SLACK) {
        return [prev, leg];
      }
    }

    if (prev.transitLeg && next.transitLeg && !leg.transitLeg) {
      // transfer with some walking
      const t1 = legTime(prev.end);
      const t2 = legTime(next.start);
      const transferDuration = legTime(leg.end) - legTime(leg.start);
      const slack = t2 - t1 - transferDuration;
      if (slack < TRANSFER_SLACK) {
        return [prev, next];
      }
    }
  }
  return null;
}

function NaviContainer({
  itinerary,
  focusToPoint,
  focusToLeg,
  relayEnvironment,
  setNavigation,
}) {
  const [currentLeg, setCurrentLeg] = useState(null);
  const [realTimeLegs, setRealTimeLegs] = useState(itinerary.legs);
  const [time, setTime] = useState(Date.now());

  // update view after every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const newLeg = realTimeLegs.find(leg => {
      return legTime(leg.start) <= time && time <= legTime(leg.end);
    });

    if (newLeg?.id !== currentLeg?.id) {
      setCurrentLeg(newLeg);
      if (newLeg) {
        focusToLeg(newLeg, false);
      }
    }
    const legQueries = [];
    itinerary.legs.forEach(leg => {
      if (leg.transitLeg) {
        legQueries.push(
          fetchQuery(
            relayEnvironment,
            legQuery,
            { id: leg.id },
            { force: true },
          ).toPromise(),
        );
      }
    });
    if (legQueries.length) {
      Promise.all(legQueries).then(responses => {
        const legMap = {};
        responses.forEach(data => {
          legMap[data.node.id] = data.node;
        });
        const rtLegs = itinerary.legs.map(l => {
          const rtLeg = legMap[l.id];
          return rtLeg ? { ...l, ...rtLeg } : { ...l };
        });
        setRealTimeLegs(rtLegs);
      });
    }
  }, [time]);

  const canceled = realTimeLegs.find(leg => leg.realtimeState === 'CANCELED');
  const transferProblem = findTransferProblem(realTimeLegs);

  return (
    <>
      <div className="navigator-top-label">
        <Navigator
          itinerary={itinerary}
          focusToPoint={focusToPoint}
          focusToLeg={focusToLeg}
          relayEnvironment={relayEnvironment}
          findTransferProbles={findTransferProblem}
          realTimeLegs={realTimeLegs}
          currentLeg={currentLeg}
          time={time}
          setTime={setTime}
          canceled={canceled}
          transferProblem={transferProblem}
        />{' '}
      </div>
      <NaviBottom setNavigation={setNavigation} />
    </>
  );
}

NaviContainer.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  focusToPoint: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  setNavigation: PropTypes.func.isRequired,
};

const withRelay = createFragmentContainer(NaviContainer, {
  itinerary: graphql`
    fragment Navigator_itinerary on Itinerary {
      start
      end
      legs {
        id
        mode
        transitLeg
        interlineWithPreviousLeg
        distance
        duration
        start {
          scheduledTime
          estimated {
            time
          }
        }
        end {
          scheduledTime
          estimated {
            time
          }
        }
        realtimeState
        legGeometry {
          points
        }
        route {
          shortName
        }
        from {
          lat
          lon
        }
        to {
          lat
          lon
          name
          stop {
            name
            code
            platformCode
            vehicleMode
          }
          vehicleParking {
            name
          }
          vehicleRentalStation {
            name
            rentalNetwork {
              networkId
            }
            availableVehicles {
              total
            }
          }
          rentalVehicle {
            rentalNetwork {
              networkId
              url
            }
          }
        }
      }
    }
  `,
});

export { NaviContainer as Component, withRelay as default };
