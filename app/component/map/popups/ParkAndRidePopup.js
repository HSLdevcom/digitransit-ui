import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import MarkerPopupBottom from '../MarkerPopupBottom';
import ParkAndRideAvailability from './ParkAndRideAvailability';
import Card from '../../Card';
import CardHeader from '../../CardHeader';

function ParkAndRidePopup(
  {
    name,
    realtime,
    maxCapacity,
    spacesAvailable,
    locationPopup,
    lat,
    lon,
    onSelectLocation,
  },
  { intl },
) {
  return (
    <div className="card">
      <Card className="card-padding">
        <CardHeader
          name={intl.formatMessage({
            id: 'park-and-ride',
            defaultMessage: 'Park and Ride',
          })}
          description={name}
          icon="icon-icon_car"
          unlinked
        />
        <ParkAndRideAvailability
          realtime={realtime}
          maxCapacity={maxCapacity}
          spacesAvailable={spacesAvailable}
        />
      </Card>
      {(locationPopup === 'all' || locationPopup === 'origindestination') && (
        <MarkerPopupBottom
          location={{
            address: name,
            lat,
            lon,
          }}
          locationPopup={locationPopup}
          onSelectLocation={onSelectLocation}
        />
      )}
    </div>
  );
}

ParkAndRidePopup.contextTypes = { intl: intlShape.isRequired };

ParkAndRidePopup.propTypes = {
  realtime: PropTypes.bool.isRequired,
  maxCapacity: PropTypes.number.isRequired,
  spacesAvailable: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  locationPopup: PropTypes.string,
  onSelectLocation: PropTypes.func,
};

export default ParkAndRidePopup;
