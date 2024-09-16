import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { createFragmentContainer, graphql, fetchQuery } from 'react-relay';
import { itineraryShape, relayShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import NaviLeg from './NaviLeg';

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

function Navigator({ itinerary, focusToLeg, relayEnvironment }) {
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

  const [time, setTime] = useState(Date.now());
  const [currentLeg, setCurrentLeg] = useState(null);
  const [realTimeLegs, setRealTimeLegs] = useState(itinerary.legs);

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

  const first = realTimeLegs[0];
  const last = realTimeLegs[realTimeLegs.length - 1];

  let info;
  if (time < legTime(first.start)) {
    info = (
      <FormattedMessage
        id="navigation-journey-start"
        values={{ time: legTimeStr(first.start) }}
      />
    );
  } else if (currentLeg) {
    if (!currentLeg.transitLeg) {
      const next = itinerary.legs.find(
        leg => legTime(leg.start) > legTime(currentLeg.start),
      );
      info = <NaviLeg leg={currentLeg} nextLeg={next} />;
    } else {
      info = `Tracking ${currentLeg?.mode} leg`;
    }
  } else if (time > legTime(last.end)) {
    info = <FormattedMessage id="navigation-journey-end" />;
  } else {
    info = <FormattedMessage id="navigation-wait" />;
  }

  return (
    <div className="navigator">
      {canceled && (
        <div className="notifiler">Osa matkan lähdöistä on peruttu</div>
      )}
      {transferProblem && (
        <div className="notifiler">{`Vaihto  ${transferProblem[0].route.shortName} - ${transferProblem[1].route.shortName} ei onnistu reittisuunnitelman mukaisesti`}</div>
      )}

      <div className="info">{info}</div>
    </div>
  );
}

Navigator.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  /*
  focusToPoint: PropTypes.func.isRequired,
  */
};

Navigator.contextTypes = {
  intl: intlShape.isRequired,
};

const withRelay = createFragmentContainer(Navigator, {
  itinerary: graphql`
    fragment Navigator_itinerary on Itinerary {
      start
      end
      legs {
        id
        mode
        transitLeg
        interlineWithPreviousLeg
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

export { Navigator as Component, withRelay as default };
