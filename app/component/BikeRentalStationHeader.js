import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
// import Favourite from './Favourite';
import Icon from '@digitransit-component/digitransit-component-icon';
import StopCode from './StopCode';
import BackButton from './BackButton';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { getJson } from '../util/xhrPromise';

const modules = {
  FavouriteBikeRentalStationContainer: () =>
    importLazy(import('./FavouriteBikeRentalStationContainer')),
};
function getZoneId(config, propertiesZones, dataZones) {
  function zoneFilter(zones) {
    return Array.isArray(zones)
      ? zones.filter(
          zone => zone && config.feedIds.includes(zone.split(':')[0]),
        )
      : [];
  }
  const filteredZones = propertiesZones
    ? zoneFilter(propertiesZones)
    : zoneFilter(dataZones);
  const zone = filteredZones.length > 0 ? filteredZones[0] : undefined;
  return zone ? zone.split(':')[1] : undefined;
}
const BikeRentalStationHeader = (
  { bikeRentalStation, breakpoint },
  { config },
) => {
  const [zoneId, setZoneId] = useState(undefined);

  getJson(config.URL.PELIAS_REVERSE_GEOCODER, {
    'point.lat': bikeRentalStation.lat,
    'point.lon': bikeRentalStation.lon,
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
  const zone = zoneId ? `zone-${zoneId}` : '';
  return (
    <div className="bike-station-header">
      {breakpoint === 'large' && (
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
        />
      )}
      <div className="header">
        <h3>{bikeRentalStation.name}</h3>
        <div className="bike-station-sub-header">
          <FormattedMessage id="citybike-station-no-id" />
          {bikeRentalStation.name !== bikeRentalStation.stationId && (
            <>
              <StopCode code={bikeRentalStation.stationId} />
              {zone && (
                <Icon img={zone} color="#007AC9" height={0.875} width={0.875} />
              )}
            </>
          )}
        </div>
      </div>
      <LazilyLoad modules={modules}>
        {({ FavouriteBikeRentalStationContainer }) => (
          <FavouriteBikeRentalStationContainer
            bikeRentalStation={bikeRentalStation}
          />
        )}
      </LazilyLoad>
    </div>
  );
};

BikeRentalStationHeader.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  bikeRentalStation: PropTypes.shape({
    name: PropTypes.string.isRequired,
    stationId: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }),
};

BikeRentalStationHeader.contextTypes = {
  config: PropTypes.object.isRequired,
  //    executeAction: PropTypes.func.isRequired,
  //    intl: intlShape.isRequired,
};

export default BikeRentalStationHeader;
