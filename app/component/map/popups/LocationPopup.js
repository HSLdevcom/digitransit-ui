import React, { PropTypes } from 'react';
import Card from '../../card/card';
import CardHeader from '../../card/card-header';
import MarkerPopupBottom from '../marker-popup-bottom';

export default function LocationPopup({ name, lat, lon }) {
  return (
    <Card>
      <div className="padding-small">
        <CardHeader
          name="Asetettu Sijainti"
          description={name}
          className="padding-small"
        />
      </div>
      <MarkerPopupBottom location={{ address: name, lat, lon }} />
    </Card>
  );
}

LocationPopup.propTypes = {
  name: PropTypes.string.isRequired,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
};
