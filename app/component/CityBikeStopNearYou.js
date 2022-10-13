import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { graphql, createRefetchContainer } from 'react-relay';
import CityBikeStopContent from './CityBikeStopContent';
import FavouriteBikeRentalStationContainer from './FavouriteBikeRentalStationContainer';
import { PREFIX_BIKESTATIONS } from '../util/path';
import { isKeyboardSelectionEvent } from '../util/browser';
import { hasStationCode } from '../util/citybikes';

const CityBikeStopNearYou = ({ stop, relay, currentTime, currentMode }) => {
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
                  stationId: hasStationCode(stop) ? stop.stationId : '',
                }}
              />
            </div>
          </div>
          <FavouriteBikeRentalStationContainer
            bikeRentalStation={stop}
            className="bike-rental-favourite-container"
          />
        </div>
        <CityBikeStopContent bikeRentalStation={stop} />
      </div>
    </span>
  );
};
CityBikeStopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  currentMode: PropTypes.string.isRequired,
  relay: PropTypes.any,
};

const containerComponent = createRefetchContainer(
  CityBikeStopNearYou,
  {
    stop: graphql`
      fragment CityBikeStopNearYou_stop on BikeRentalStation {
        stationId
        name
        bikesAvailable
        spacesAvailable
        capacity
        networks
        state
      }
    `,
  },
  graphql`
    query CityBikeStopNearYouRefetchQuery($stopId: String!) {
      bikeRentalStation(id: $stopId) {
        ...CityBikeStopNearYou_stop
      }
    }
  `,
);

export { containerComponent as default, CityBikeStopNearYou as Component };
