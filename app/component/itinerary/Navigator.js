import React, { useEffect, useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { itineraryShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import NaviLeg from './NaviLeg';

/*
  const legQuery = graphql`
  query legQuery($id: String!) {
    node(id: $id) {
      ... on Leg {
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
      }
    }
  }
`;
*/

function Navigator({ itinerary }) {
  const [time, setTime] = useState(Date.now());
  const [currentLeg, setCurrentLeg] = useState(null);

  // update view after every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newLeg = itinerary.legs.find(leg => {
      return legTime(leg.start) <= time && time <= legTime(leg.end);
    });

    if (newLeg && newLeg !== currentLeg) {
      setCurrentLeg(newLeg);
    }
  }, [time]);
  const first = itinerary.legs[0];
  const last = itinerary.legs[itinerary.legs.length - 1];
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
      <div className="info">{info}</div>
    </div>
  );
}

Navigator.propTypes = {
  itinerary: itineraryShape.isRequired,
  /*
  focusToPoint: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
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
        mode
        transitLeg
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
        legGeometry {
          points
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
