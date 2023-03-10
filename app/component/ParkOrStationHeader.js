import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import StopCode from './StopCode';
import BackButton from './BackButton';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { getJson } from '../util/xhrPromise';
import getZoneId from '../util/zoneIconUtils';
import ZoneIcon from './ZoneIcon';
import withBreakpoint from '../util/withBreakpoint';
import { getCityBikeNetworkConfig, hasStationCode } from '../util/citybikes';

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
        if (id) {
          setZoneId(id.toString().toLowerCase());
        }
      }
    });
  }, []);

  const { name, bikeParkId, stationId } = parkOrStation;

  let subheaderMsgId;
  if (stationId) {
    // If `parkOrStation` has a `stationId`, it is a vehicle rental station. In
    // this case, it also has `networks[]`.
    const networkConfig = getCityBikeNetworkConfig(
      parkOrStation.networks[0],
      config,
    );
    // TODO need to distinguish between rental station and free floating vehicle
    subheaderMsgId = `${networkConfig?.type || 'citybike'}-station-no-id`;
  } else {
    subheaderMsgId = bikeParkId ? 'bike-park' : 'car_park';
  }

  // TODO OTP returns the ID of free floating vehicle as name, we should not disply the random string:
  // https://github.com/opentripplanner/OpenTripPlanner/blob/215af2cd009e402612be9bfd8d38cc8ba5a3c957/src/main/java/org/opentripplanner/updater/vehicle_rental/datasources/GbfsFreeVehicleStatusMapper.java#L36
  // TODO don't show FavouriteBikeRentalStationContainer for free floating vehicles
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
          <FormattedMessage id={subheaderMsgId} />
          {hasStationCode(parkOrStation) && <StopCode code={stationId} />}
          {zoneId && (
            <span className="bike-station-zone-icon">
              <ZoneIcon zoneId={zoneId.toUpperCase()} />
            </span>
          )}
        </div>
      </div>
      {stationId && (
        <LazilyLoad modules={modules}>
          {({ FavouriteBikeRentalStationContainer }) => (
            <FavouriteBikeRentalStationContainer
              bikeRentalStation={parkOrStation}
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
    bikeParkId: PropTypes.string,
    carParkId: PropTypes.string,
    stationId: PropTypes.string,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    networks: PropTypes.array.isRequired,
  }),
};

ParkOrBikeStationHeader.contextTypes = {
  config: PropTypes.object.isRequired,
};

const ParkOrBikeStationHeaderWithBreakpoint = withBreakpoint(
  ParkOrBikeStationHeader,
);

export default ParkOrBikeStationHeaderWithBreakpoint;
