import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import StopCode from './StopCode';
import BackButton from './BackButton';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { getJson } from '../util/xhrPromise';
import getZoneId from '../util/zoneIconUtils';
import ZoneIcon from './ZoneIcon';

const modules = {
  FavouriteBikeRentalStationContainer: () =>
    importLazy(import('./FavouriteBikeRentalStationContainer')),
};
const ParkOrBikeStationHeader = ({ parkOrStation, breakpoint }, { config }) => {
  const [zoneId, setZoneId] = useState(undefined);
  useEffect(() => {
    getJson(config.URL.PELIAS_REVERSE_GEOCODER, {
      'point.lat': parkOrStation.lat,
      'point.lon': parkOrStation.lon,
      'boundary.circle.radius': 0.2,
      layers: 'address',
      size: 1,
      zones: 1,
    }).then(data => {
      if (data.features != null && data.features.length > 0) {
        const match = data.features[0].properties;
        const id = getZoneId(config, match.zones, data.zones);
        setZoneId(id.toString().toLowerCase());
      }
    });
  }, []);

  const { name, bikeParkId, stationId } = parkOrStation;
  const parkHeaderId = bikeParkId ? 'bike-park' : 'car_park';
  return (
    <div className="bike-station-header">
      {breakpoint === 'large' && (
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
        />
      )}
      <div className="header">
        <h1>{name}</h1>
        <div className="bike-station-sub-header">
          <FormattedMessage
            id={stationId ? 'citybike-station-no-id' : parkHeaderId}
          />
          {stationId && name !== stationId && <StopCode code={stationId} />}
          {zoneId && (
            <span className="bike-station-zone-icon">
              <ZoneIcon zoneId={zoneId.toUpperCase()} />
            </span>
          )}
        </div>
      </div>
      <LazilyLoad modules={modules}>
        {({ FavouriteBikeRentalStationContainer }) => (
          <FavouriteBikeRentalStationContainer
            bikeRentalStation={parkOrStation}
          />
        )}
      </LazilyLoad>
    </div>
  );
};

ParkOrBikeStationHeader.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  parkOrStation: PropTypes.shape({
    name: PropTypes.string.isRequired,
    bikeParkId: PropTypes.string,
    carParkId: PropTypes.string,
    stationId: PropTypes.string,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }),
};

ParkOrBikeStationHeader.contextTypes = {
  config: PropTypes.object.isRequired,
  parkOrStation: {
    stationId: null,
    bikeParkId: null,
    carParkId: null,
  },
};

export default ParkOrBikeStationHeader;
