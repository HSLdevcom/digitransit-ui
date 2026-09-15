import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { withLeaflet } from 'react-leaflet/es/context';
import Marker from 'react-leaflet/es/Marker';
import Popup from 'react-leaflet/es/Popup';
import { default as L } from 'leaflet';
import { locationShape } from '../../../utils/client/shapes';
import { useConfigContext } from '../../client/ConfigContext';

function GenericMarker({
  shouldRender = () => true,
  position,
  getIcon,
  renderName = false,
  name = '',
  maxWidth = undefined,
  minWidth = undefined,
  children = undefined,
  leaflet,
  onClick = () => {},
  zIndexOffset = undefined,
}) {
  const config = useConfigContext();
  const [zoom, setZoom] = useState(() => leaflet.map.getZoom());

  useEffect(() => {
    const onMapMove = () => setZoom(leaflet.map.getZoom());
    leaflet.map.on('zoomend', onMapMove);
    return () => leaflet.map.off('zoomend', onMapMove);
  }, [leaflet.map]);

  if (isFunction(shouldRender) && !shouldRender(zoom)) {
    return null;
  }

  const marker = (
    <Marker
      position={{ lat: position.lat, lng: position.lon }}
      icon={getIcon(zoom)}
      onClick={onClick}
      keyboard={false}
      zIndexOffset={zIndexOffset}
    >
      {children && (
        <Popup
          maxWidth={maxWidth || config.map.genericMarker.popup.maxWidth}
          minWidth={minWidth || config.map.genericMarker.popup.minWidth}
          className="popup"
        >
          {children}
        </Popup>
      )}
    </Marker>
  );

  const nameMarker = renderName &&
    leaflet.map.getZoom() >= config.map.genericMarker.nameMarkerMinZoom && (
      <Marker
        key={`${name}_text`}
        position={{
          lat: position.lat,
          lng: position.lon,
        }}
        interactive={false}
        icon={L.divIcon({
          html: `<div>${name}</div>`,
          className: 'popup',
          iconSize: [150, 0],
          iconAnchor: [-8, 7],
        })}
        keyboard={false}
        zIndexOffset={zIndexOffset}
      />
    );

  return (
    <React.Fragment>
      {marker}
      {nameMarker}
    </React.Fragment>
  );
}

GenericMarker.displayName = 'GenericMarker';

GenericMarker.propTypes = {
  shouldRender: PropTypes.func,
  position: locationShape.isRequired,
  getIcon: PropTypes.func.isRequired,
  renderName: PropTypes.bool,
  name: PropTypes.string,
  maxWidth: PropTypes.number,
  minWidth: PropTypes.number,
  children: PropTypes.node,
  leaflet: PropTypes.shape({
    map: PropTypes.shape({
      getZoom: PropTypes.func.isRequired,
      on: PropTypes.func.isRequired,
      off: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  onClick: PropTypes.func,
  zIndexOffset: PropTypes.number,
};

const leafletComponent = withLeaflet(GenericMarker);
export { leafletComponent as default, GenericMarker as Component };
