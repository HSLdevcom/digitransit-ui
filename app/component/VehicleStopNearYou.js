import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { graphql, createRefetchContainer } from 'react-relay';
import VehicleRentalStationStopContent from './VehicleRentalStationStopContent';
import FavouriteVehicleRentalStationContainer from './FavouriteVehicleRentalStationContainer';
import { PREFIX_BIKESTATIONS } from '../util/path';
import { isKeyboardSelectionEvent } from '../util/browser';
import { hasStationCode } from '../util/vehicleRentalUtils';
import { getIdWithoutFeed } from '../util/feedScopedIdUtils';

const VehicleStopNearYou = ({ stop, relay, currentTime, currentMode }) => {
  useEffect(() => {
    const { stationId } = stop;
    if (currentMode === 'CITYBIKE') {
      relay?.refetch(
        oldVariables => {
          return { ...oldVariables, stopId: stationId };
        },
        null,
        null,
        { force: true }, // query variables stay the same between refetches
      );
    }
  }, [currentTime]);
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
              to={`/${PREFIX_BIKESTATIONS}/${stop.stationId}`}
            >
              <h3 className="stop-near-you-name">{stop.name}</h3>
            </Link>
            <div className="bike-station-code">
              <FormattedMessage
                id="citybike-station"
                values={{
                  stationId: hasStationCode(stop)
                    ? getIdWithoutFeed(stop.stationId)
                    : '',
                }}
              />
            </div>
          </div>
          <FavouriteVehicleRentalStationContainer
            vehicleRentalStation={stop}
            className="bike-rental-favourite-container"
          />
        </div>
        <VehicleRentalStationStopContent vehicleRentalStation={stop} />
      </div>
    </span>
  );
};
VehicleStopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  currentMode: PropTypes.string.isRequired,
  relay: PropTypes.any,
};

const containerComponent = createRefetchContainer(
  VehicleStopNearYou,
  {
    stop: graphql`
      fragment VehicleStopNearYou_stop on VehicleRentalStation {
        stationId
        name
        vehiclesAvailable
        spacesAvailable
        capacity
        network
        operative
      }
    `,
  },
  graphql`
    query VehicleStopNearYouRefetchQuery($stopId: String!) {
      vehicleRentalStation(id: $stopId) {
        ...VehicleStopNearYou_stop
      }
    }
  `,
);

export { containerComponent as default, VehicleStopNearYou as Component };
