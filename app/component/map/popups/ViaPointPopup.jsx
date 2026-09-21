import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import Popup from 'react-leaflet/es/Popup';
import { setIntermediatePlaces } from '../../../../utils/client/queryUtils';
import { locationToOTP } from '../../../../utils/shared/otpStrings';
import Card from '../../Card';
import {
  useViaPoints,
  useItineraryLocationActions,
} from '../../../hooks/ItineraryLocationContext';

const filterViaPoint = (allPoints, pointToRemove) => {
  return allPoints.filter(
    p => p.lat !== pointToRemove.lat && p.lon !== pointToRemove.lon,
  );
};

function ViaPointPopup({ lat, lon }, { router, match }) {
  const viaPoints = useViaPoints();
  const { setViaPoints } = useItineraryLocationActions();
  const currentPoint = { lat, lon };

  const deleteViaPoint = e => {
    e.preventDefault();
    e.stopPropagation();
    const filteredViaPoints = filterViaPoint(viaPoints, currentPoint);
    setViaPoints(filteredViaPoints);
    setIntermediatePlaces(router, match, filteredViaPoints.map(locationToOTP));
  };

  return (
    <Popup
      position={{ lat: lat + 0.0001, lng: lon }}
      offset={[0, 0]}
      autoPanPaddingTopLeft={[5, 125]}
      maxWidth={120}
      maxHeight={80}
      autoPan={false}
      className="popup single-popup"
    >
      <Card className="no-margin">
        <div className="location-popup-wrapper">
          <div className="location-address">
            <FormattedMessage id="via-point" defaultMessage="Via point" />
          </div>
        </div>

        <div className="bottom location">
          <button
            type="button"
            onClick={e => deleteViaPoint(e)}
            className="route cursor-pointer route-add-viapoint"
          >
            <FormattedMessage id="delete" defaultMessage="Delete" />
          </button>
        </div>
      </Card>
    </Popup>
  );
}

ViaPointPopup.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
};

ViaPointPopup.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export { ViaPointPopup as default, ViaPointPopup as Component };
