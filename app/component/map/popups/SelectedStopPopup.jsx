import PropTypes from 'prop-types';
import React from 'react';
import Popup from 'react-leaflet/es/Popup';
import { useConfigContext } from '../../../client/ConfigContext';

export default function SelectedStopPopup({ lat, lon, children }) {
  const config = useConfigContext();
  return (
    <Popup
      position={{ lat: lat + 0.0001, lng: lon }}
      offset={[50, 15]}
      maxWidth={config.map.genericMarker.popup.maxWidth}
      autoPan={false}
      className="origin-popup"
    >
      {children}
    </Popup>
  );
}

SelectedStopPopup.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
};

SelectedStopPopup.displayName = 'SelectedStopLabel';
