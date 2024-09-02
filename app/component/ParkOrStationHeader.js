import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../util/shapes';
import StopCode from './StopCode';
import BackButton from './BackButton';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { getJson } from '../util/xhrPromise';
import getZoneId from '../util/zoneIconUtils';
import ZoneIcon from './ZoneIcon';
import withBreakpoint from '../util/withBreakpoint';
import { hasVehicleRentalCode } from '../util/vehicleRentalUtils';
import { getIdWithoutFeed } from '../util/feedScopedIdUtils';

const modules = {
  FavouriteVehicleRentalStationContainer: () =>
    importLazy(import('./FavouriteVehicleRentalStationContainer')),
};
const ParkOrBikeStationHeader = (
  { parkOrStation, breakpoint, parkType },
  { config },
) => {
  const [zoneId, setZoneId] = useState(undefined);
  useEffect(() => {
    const searchParams = {
      'point.lat': parkOrStation.lat,
      'point.lon': parkOrStation.lon,
      'boundary.circle.radius': 0.2,
      layers: 'address',
      size: 1,
      zones: 1,
    };
    if (config.searchParams['boundary.country']) {
      searchParams['boundary.country'] =
        config.searchParams['boundary.country'];
    }

    getJson(config.URL.PELIAS_REVERSE_GEOCODER, searchParams).then(data => {
      if (data.features != null && data.features.length > 0) {
        const match = data.features[0].properties;
        const id = getZoneId(config, match.zones, data.zones);
        if (id) {
          setZoneId(id.toString().toLowerCase());
        }
      }
    });
  }, []);

  const { name, stationId } = parkOrStation;
  const parkHeaderId = parkType === 'bike' ? 'bike-park' : 'car-park';
  const isRentalStation = stationId;

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
            id={isRentalStation ? 'citybike-station-no-id' : parkHeaderId}
          />
          {isRentalStation && hasVehicleRentalCode(stationId) && (
            <StopCode code={getIdWithoutFeed(stationId)} />
          )}
          {zoneId && (
            <span className="bike-station-zone-icon">
              <ZoneIcon zoneId={zoneId.toUpperCase()} />
            </span>
          )}
        </div>
      </div>
      {isRentalStation && (
        <LazilyLoad modules={modules}>
          {({ FavouriteVehicleRentalStationContainer }) => (
            <FavouriteVehicleRentalStationContainer
              vehicleRentalStation={parkOrStation}
            />
          )}
        </LazilyLoad>
      )}
    </div>
  );
};

ParkOrBikeStationHeader.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  parkOrStation: PropTypes.shape({
    name: PropTypes.string.isRequired,
    stationId: PropTypes.string,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  parkType: PropTypes.string,
};

ParkOrBikeStationHeader.defaultProps = { parkType: undefined };

ParkOrBikeStationHeader.contextTypes = {
  config: configShape.isRequired,
};

const ParkOrBikeStationHeaderWithBreakpoint = withBreakpoint(
  ParkOrBikeStationHeader,
);

export default ParkOrBikeStationHeaderWithBreakpoint;
