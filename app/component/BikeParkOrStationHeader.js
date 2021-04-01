import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
// import Favourite from './Favourite';
import Icon from '@digitransit-component/digitransit-component-icon';
import StopCode from './StopCode';
import BackButton from './BackButton';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { getJson } from '../util/xhrPromise';
import getZoneId from '../util/zoneIconUtils';

const modules = {
  FavouriteBikeRentalStationContainer: () =>
    importLazy(import('./FavouriteBikeRentalStationContainer')),
};
const BikeParkOrStationHeader = (
  { bikeParkOrStation, breakpoint },
  { config },
) => {
  const [zoneId, setZoneId] = useState(undefined);
  useEffect(() => {
    getJson(config.URL.PELIAS_REVERSE_GEOCODER, {
      'point.lat': bikeParkOrStation.lat,
      'point.lon': bikeParkOrStation.lon,
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
  const zone = zoneId ? `zone-${zoneId}` : '';

  const { name, bikeParkId, stationId } = bikeParkOrStation;
  return (
    <div className="bike-station-header">
      {breakpoint === 'large' && (
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
        />
      )}
      <div className="header">
        <h3>{name}</h3>
        <div className="bike-station-sub-header">
          <FormattedMessage
            id={bikeParkId ? 'bike-park' : 'citybike-station-no-id'}
          />
          {stationId && name !== stationId && (
            <>
              <StopCode code={stationId} />
            </>
          )}
          {zone && (
            <span className="bike-station-zone-icon">
              <Icon img={zone} color="#007AC9" />
            </span>
          )}
        </div>
      </div>
      <LazilyLoad modules={modules}>
        {({ FavouriteBikeRentalStationContainer }) => (
          <FavouriteBikeRentalStationContainer
            bikeRentalStation={bikeParkOrStation}
          />
        )}
      </LazilyLoad>
    </div>
  );
};

BikeParkOrStationHeader.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  bikeParkOrStation: PropTypes.shape({
    name: PropTypes.string.isRequired,
    bikeParkId: PropTypes.string,
    stationId: PropTypes.string,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }),
};

BikeParkOrStationHeader.contextTypes = {
  config: PropTypes.object.isRequired,
  bikeParkOrStation: {
    stationId: null,
    bikeParkId: null,
  },
};

export default BikeParkOrStationHeader;
