import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { graphql, createRefetchContainer } from 'react-relay';
import VehicleRentalStation from '../VehicleRentalStation.jsx';
import FavouriteVehicleRentalStationContainer from '../FavouriteVehicleRentalStationContainer.jsx';
import { PREFIX_BIKESTATIONS } from '../../util/path.js';
import { isKeyboardSelectionEvent } from '../../util/browser.js';
import { hasVehicleRentalCode } from '../../util/vehicleRentalUtils.js';
import { vehicleRentalStationShape, relayShape } from '../../util/shapes.js';
import { splitGtfsId } from '../../util/gtfs.js';

const VehicleRentalStationNearYou = ({
  station,
  relay,
  currentTime,
  isParentTabActive,
}) => {
  const timeRef = useRef(currentTime);

  useEffect(() => {
    const { stationId } = station;
    if (isParentTabActive && currentTime - timeRef.current > 30) {
      relay.refetch(
        oldVariables => {
          return { ...oldVariables, stationId };
        },
        null,
        null,
        { force: true }, // query variables stay the same between refetches
      );
      timeRef.current = currentTime;
    }
  }, [currentTime, isParentTabActive]);

  return (
    <span role="listitem">
      <div className="stop-near-you-container">
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
              to={`/${PREFIX_BIKESTATIONS}/${station.stationId}`}
            >
              <h3 className="stop-near-you-name">{station.name}</h3>
            </Link>
            <div className="bike-station-code">
              <FormattedMessage
                id="citybike-station"
                values={{
                  stationId: hasVehicleRentalCode(station.stationId)
                    ? splitGtfsId(station.stationId).entityId
                    : '',
                }}
              />
            </div>
          </div>
          <FavouriteVehicleRentalStationContainer
            vehicleRentalStation={station}
            className="bike-rental-favourite-container"
          />
        </div>
        <VehicleRentalStation vehicleRentalStation={station} />
      </div>
    </span>
  );
};

VehicleRentalStationNearYou.propTypes = {
  station: vehicleRentalStationShape.isRequired,
  currentTime: PropTypes.number,
  isParentTabActive: PropTypes.bool,
  relay: relayShape.isRequired,
};

VehicleRentalStationNearYou.defaultProps = {
  currentTime: undefined,
  isParentTabActive: false,
};

const containerComponent = createRefetchContainer(
  VehicleRentalStationNearYou,
  {
    station: graphql`
      fragment VehicleRentalStationNearYou_station on VehicleRentalStation {
        stationId
        name
        availableVehicles {
          total
        }
        availableSpaces {
          total
        }
        capacity
        rentalNetwork {
          networkId
        }
        operative
      }
    `,
  },
  graphql`
    query VehicleRentalStationNearYouRefetchQuery($stationId: String!) {
      vehicleRentalStation(id: $stationId) {
        ...VehicleRentalStationNearYou_station
      }
    }
  `,
);

export {
  containerComponent as default,
  VehicleRentalStationNearYou as Component,
};
