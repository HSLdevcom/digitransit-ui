import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { itineraryShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import Icon from '../Icon';
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

function Navigator({ itinerary, focusToLeg, setNavigation }, context) {
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
      focusToLeg(newLeg, false);
    }
  }, [time]);

  const first = itinerary.legs[0];
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
      info = <NaviLeg leg={currentLeg} focusToLeg={focusToLeg} />;
    } else {
      info = `Tracking ${currentLeg?.mode} leg`;
    }
  }
  return (
    <div className="navigator">
      <div className="navigator-top-section">
        <FormattedMessage id="navigation-header" />
        <button
          type="button"
          aria-label={context.intl.formatMessage({
            id: 'navigation-label-close',
            defaultMessage: 'Close the navigator view',
          })}
          onClick={() => setNavigation(false)}
          className="close-navigator"
        >
          <Icon img="icon-icon_close" className="close-navigator-icon" />
        </button>
      </div>
      <div className="divider" />
      <div className="info">{info}</div>
    </div>
  );
}

Navigator.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  setNavigation: PropTypes.func.isRequired,
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
