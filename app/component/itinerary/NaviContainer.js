import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql, fetchQuery } from 'react-relay';
import { itineraryShape, relayShape } from '../../util/shapes';
import NaviTop from './NaviTop';
import NaviBottom from './NaviBottom';
import { legTime } from '../../util/legUtils';
import { checkPositioningPermission } from '../../action/PositionActions';

const legQuery = graphql`
  query NaviContainer_legQuery($id: String!) {
    leg(id: $id) {
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
      to {
        stop {
          parentStation {
            name
          }
        }
        vehicleRentalStation {
          availableVehicles {
            total
          }
        }
      }
      realtimeState
    }
  }
`;

function NaviContainer({
  itinerary,
  focusToLeg,
  relayEnvironment,
  setNavigation,
  mapRef,
}) {
  const [realTimeLegs, setRealTimeLegs] = useState(itinerary.legs);
  const [time, setTime] = useState(Date.now());
  const locationOK = useRef(true);
  // update view after every 10 seconds
  useEffect(() => {
    checkPositioningPermission().then(permission => {
      locationOK.current = permission.state === 'granted';
      if (locationOK.current) {
        mapRef?.enableMapTracking();
      }
      setTime(Date.now()); // force refresh
    });
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
          legMap[data.leg.id] = data.leg;
        });
        const rtLegs = itinerary.legs.map(l => {
          const rtLeg = l.id ? legMap[l.id] : null;
          return rtLeg ? { ...l, ...rtLeg } : { ...l };
        });
        setRealTimeLegs(rtLegs);
      });
    }
  }, [time]);

  // recompute estimated arrival
  let lastTransitLeg;
  let arrivalChange = 0;
  itinerary.legs.forEach(leg => {
    if (leg.transitLeg) {
      lastTransitLeg = leg;
    }
  });
  if (lastTransitLeg) {
    const rtLeg = realTimeLegs.find(leg => {
      return leg.id === lastTransitLeg.id;
    });
    arrivalChange = legTime(rtLeg.end) - legTime(lastTransitLeg.end);
  }
  const arrivalTime =
    legTime(itinerary.legs[itinerary.legs.length - 1].end) + arrivalChange;

  return (
    <>
      <NaviTop
        itinerary={itinerary}
        realTimeLegs={realTimeLegs}
        focusToLeg={
          mapRef?.state.mapTracking || locationOK.current ? null : focusToLeg
        }
        time={time}
      />{' '}
      <NaviBottom setNavigation={setNavigation} arrival={arrivalTime} />
    </>
  );
}

NaviContainer.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  setNavigation: PropTypes.func.isRequired,
  // eslint-disable-next-line
  mapRef: PropTypes.object,
  position: PropTypes.shape({
    hasLocation: PropTypes.bool.isRequired,
    locationingFailed: PropTypes.bool,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
};

NaviContainer.defaultProps = { mapRef: undefined };

const withRelay = createFragmentContainer(NaviContainer, {
  itinerary: graphql`
    fragment NaviContainer_itinerary on Itinerary {
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
          vehicleRentalStation {
            name
            rentalNetwork {
              networkId
            }
            availableVehicles {
              total
            }
          }
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
