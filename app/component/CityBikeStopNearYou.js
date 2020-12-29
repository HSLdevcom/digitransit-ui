import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import CityBikeStopContent from './CityBikeStopContent';
import FavouriteBikeRentalStationContainer from './FavouriteBikeRentalStationContainer';

import { PREFIX_BIKESTATIONS } from '../util/path';
import { isKeyboardSelectionEvent } from '../util/browser';

const CityBikeStopNearYou = ({ stop }) => {
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
                  stationId: stop.name !== stop.stationId ? stop.stationId : '',
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
};

export default CityBikeStopNearYou;
