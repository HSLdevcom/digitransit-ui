import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import MapBottomsheetContext from './MapBottomsheetContext';
import Map from './Map';
import { useConfigContext } from '../../client/ConfigContext';
import useGeoJsonObjects from '../../hooks/useGeoJsonObjects';

function MapContainer({ className = '', children, ...props }) {
  const contextPadding = useContext(MapBottomsheetContext);
  const config = useConfigContext();
  const geoJson = useGeoJsonObjects(config.geoJson);
  return (
    <div className={`map ${className}`}>
      <Map {...props} bottomPadding={contextPadding} geoJson={geoJson} />
      {children}
    </div>
  );
}

MapContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default MapContainer;
