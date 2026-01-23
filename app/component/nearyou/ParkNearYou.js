import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import { graphql, createRefetchContainer } from 'react-relay';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../../util/path';
import { isKeyboardSelectionEvent } from '../../util/browser';
import { parkShape, relayShape } from '../../util/shapes';
import ParkAndRideContent from '../ParkAndRideContent';

const ParkNearYou = ({ park, relay, currentTime, isParentTabActive, mode }) => {
  const timeRef = useRef(currentTime);

  useEffect(() => {
    const { vehicleParkingId } = park;
    if (isParentTabActive && currentTime - timeRef.current > 30) {
      relay.refetch(
        oldVariables => {
          return { ...oldVariables, vehicleParkingId };
        },
        null,
        null,
        { force: true }, // query variables stay the same between refetches
      );
      timeRef.current = currentTime;
    }
  }, [currentTime, isParentTabActive]);

  const prefix = mode === 'BIKEPARK' ? PREFIX_BIKEPARK : PREFIX_CARPARK;
  return (
    <span role="listitem">
      <div className="stop-near-you-container-with-hover">
        <div className="stop-near-you-header-container">
          <div className="stop-header-content">
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              onKeyPress={e => {
                if (isKeyboardSelectionEvent(e)) {
                  e.stopPropagation();
                }
              }}
              to={`/${prefix}/${park.vehicleParkingId}`}
            >
              <ParkAndRideContent
                vehicleParking={park}
                mode={mode}
                showInfo={false}
                backButton={false}
              />
            </Link>
          </div>
        </div>
      </div>
    </span>
  );
};

ParkNearYou.propTypes = {
  park: parkShape.isRequired,
  currentTime: PropTypes.number,
  isParentTabActive: PropTypes.bool,
  relay: relayShape.isRequired,
  mode: PropTypes.string.isRequired,
};

ParkNearYou.defaultProps = {
  currentTime: undefined,
  isParentTabActive: false,
};

const containerComponent = createRefetchContainer(
  ParkNearYou,
  {
    park: graphql`
      fragment ParkNearYou_park on VehicleParking {
        ...ParkContainer_vehicleParking
        vehicleParkingId
        name
        lat
        lon
        availability {
          bicycleSpaces
          carSpaces
        }
        parkCapacity: capacity {
          carSpaces
        }
        tags
        realtime
      }
    `,
  },
  graphql`
    query ParkNearYouRefetchQuery($vehicleParkingId: String!) {
      vehicleParking(id: $vehicleParkingId) {
        ...ParkNearYou_park
      }
    }
  `,
);

export { containerComponent as default, ParkNearYou as Component };
