import React, { PropTypes } from 'react';
import { intlShape } from 'react-intl';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import MarkerPopupBottom from '../MarkerPopupBottom';

export default function LocationPopup({ name, lat, lon }, { intl }) {
  return (
    <Card>
      <div className="padding-small">
        <CardHeader
          name={intl.formatMessage({ id: 'location-from-map', defaultMessage: 'Picked location' })}
          description={name}
          unlinked
          className="padding-small"
        />
      </div>
      <MarkerPopupBottom
        location={{
          // XXX Use name here when it's implemented.
          address: intl.formatMessage({
            id: 'location-from-map',
            defaultMessage: 'Picked location',
          }),
          lat,
          lon,
        }}
      />
    </Card>
  );
}

LocationPopup.contextTypes = {
  intl: intlShape.isRequired,
};

LocationPopup.propTypes = {
  name: PropTypes.string.isRequired,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
};
