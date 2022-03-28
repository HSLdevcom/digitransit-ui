import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';

import ViaPointStore from '../../../store/ViaPointStore';
import { setViaPoints } from '../../../action/ViaPointActions';
import { setIntermediatePlaces } from '../../../util/queryUtils';
import { locationToOTP } from '../../../util/otpStrings';
import Card from '../../Card';
import { isBrowser } from '../../../util/browser';

const Popup = isBrowser ? require('react-leaflet/es/Popup').default : null; // eslint-disable-line global-require

const filterViaPoint = (allPoints, pointToRemove) => {
  return allPoints.filter(
    p => p.lat !== pointToRemove.lat && p.lon !== pointToRemove.lon,
  );
};

function ViaPointPopup(
  { lat, lon, viaPoints },
  { executeAction, router, match },
) {
  const currentPoint = { lat, lon };

  const deleteViaPoint = e => {
    e.preventDefault();
    e.stopPropagation();
    const filteredViaPoints = filterViaPoint(viaPoints, currentPoint);
    executeAction(setViaPoints, filteredViaPoints);
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
  viaPoints: PropTypes.array.isRequired,
};

ViaPointPopup.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

const connectedComponent = connectToStores(
  ViaPointPopup,
  [ViaPointStore],
  ({ getStore }) => {
    const viaPoints = getStore(ViaPointStore).getViaPoints();
    return { viaPoints };
  },
);

export { connectedComponent as default, ViaPointPopup as Component };
