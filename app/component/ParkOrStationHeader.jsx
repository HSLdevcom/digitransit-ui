import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../util/shapes.js';
import StopCode from './StopCode.jsx';
import withBreakpoint from '../util/withBreakpoint.jsx';
import BackButton from './BackButton.jsx';
import { getJson } from '../util/xhrPromise.js';
import getZoneId from '../util/zoneIconUtils.js';
import ZoneIcon from './ZoneIcon.jsx';
import { hasVehicleRentalCode } from '../util/vehicleRentalUtils.js';
import FavouriteVehicleRentalStationContainer from './FavouriteVehicleRentalStationContainer.jsx';
import { splitGtfsId } from '../util/gtfs.js';

const ParkOrBikeStationHeader = (
  { parkOrStation, breakpoint, parkType, backButton, withSeparator },
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
  const cn = withSeparator ? 'station-header-with-separator' : 'station-header';
  return (
    <div className={cn}>
      {breakpoint === 'large' && backButton && <BackButton />}
      <div className="header-section">
        <h1>{name}</h1>
        <div className="station-sub-header">
          <FormattedMessage
            id={isRentalStation ? 'citybike-station-no-id' : parkHeaderId}
          />
          {isRentalStation && hasVehicleRentalCode(stationId) && (
            <StopCode code={splitGtfsId(stationId).entityId} />
          )}
          {zoneId && (
            <span className="station-zone-icon">
              <ZoneIcon zoneId={zoneId.toUpperCase()} />
            </span>
          )}
        </div>
      </div>
      {isRentalStation && (
        <FavouriteVehicleRentalStationContainer
          vehicleRentalStation={parkOrStation}
        />
      )}
    </div>
  );
};

ParkOrBikeStationHeader.propTypes = {
  backButton: PropTypes.bool,
  parkOrStation: PropTypes.shape({
    name: PropTypes.string.isRequired,
    stationId: PropTypes.string,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  parkType: PropTypes.string,
  breakpoint: PropTypes.string.isRequired,
  withSeparator: PropTypes.bool,
};

ParkOrBikeStationHeader.defaultProps = {
  parkType: undefined,
  backButton: true,
  withSeparator: true,
};

ParkOrBikeStationHeader.contextTypes = {
  config: configShape.isRequired,
};

const ParkOrBikeStationHeaderWithBreakpoint = withBreakpoint(
  ParkOrBikeStationHeader,
);

export default ParkOrBikeStationHeaderWithBreakpoint;
