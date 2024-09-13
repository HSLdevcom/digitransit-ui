import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { createFragmentContainer, graphql, fetchQuery } from 'react-relay';
import { itineraryShape, relayShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import Icon from '../Icon';
import NaviLeg from './NaviLeg';

const legQuery = graphql`
  query Navigator_legQuery($id: ID!) {
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
        realtimeState
      }
    }
  }
`;

function Navigator(
  { itinerary, focusToLeg, setNavigation, relayEnvironment },
  context,
) {
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
      info = (
        <NaviLeg leg={currentLeg} focusToLeg={focusToLeg} nextLeg={next} />
      );
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
      {canceled && (
        <div className="notifiler">Osa matkan lähdöistä on peruttu</div>
      )}
      <div className="info">{info}</div>
    </div>
  );
}

Navigator.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  setNavigation: PropTypes.func.isRequired,
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
