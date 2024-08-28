import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { itineraryShape } from '../../util/shapes';
import { legTime } from '../../util/legUtils';

function Navigator({
  itinerary,
  focusToLeg /* focusToPoint, relayEnvironment */,
}) {
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
      focusToLeg(newLeg);
    }
  }, [time]);

  return (
    <div>
      Tracking {itinerary.legs.length} legs, current {currentLeg?.mode}
    </div>
  );
}

Navigator.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  /*
  focusToPoint: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  */
};

const withRelay = createFragmentContainer(Navigator, {
  itinerary: graphql`
    fragment Navigator_itinerary on Itinerary {
      start
      end
      legs {
        mode
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
        }
      }
    }
  `,
});

export { Navigator as Component, withRelay as default };
