import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { default as L } from 'leaflet';
import Marker from 'react-leaflet/es/Marker';

export default function IconMarker({ icon, zIndexOffset, children, ...rest }) {
  const [div, setDiv] = useState(undefined);
  const hasMounted = useRef(false);

  // The leaflet icon instance is created once and kept stable for the
  // lifetime of the component; subsequent icon prop changes are applied via
  // icon.initialize() below, mirroring the previous componentDidUpdate.
  const iconInstance = useMemo(() => {
    const DivIcon = L.Icon.extend({
      options: {
        // @section
        // @aka DivIcon options
        iconSize: [12, 12], // also can be set through CSS

        // iconAnchor: (Point),
        // popupAnchor: (Point),

        // @option html: String = ''
        // Custom HTML code to put inside the div element, empty by default.
        element: false,

        className: 'leaflet-div-icon',
      },

      createIcon(oldIcon) {
        const newDiv =
          oldIcon && oldIcon.tagName === 'DIV'
            ? oldIcon
            : document.createElement('div');

        setDiv(newDiv);

        // eslint-disable-next-line no-underscore-dangle
        this._setIconStyles(newDiv, 'icon');

        return newDiv;
      },

      createShadow() {
        return null;
      },
    });

    return new DivIcon(icon);
    // Intentionally created only once (empty deps) - see comment above.
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      iconInstance.initialize(icon);
    } else {
      hasMounted.current = true;
    }
  }, [icon, iconInstance]);

  return [
    div && createPortal(icon.element, div, 'icon'),
    <Marker
      key="marker"
      {...rest}
      icon={iconInstance}
      keyboard={false}
      zIndexOffset={zIndexOffset}
    >
      {children}
    </Marker>,
  ];
}

IconMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  icon: PropTypes.shape({
    element: PropTypes.node.isRequired,
  }).isRequired,
  zIndexOffset: PropTypes.number,
  children: PropTypes.node,
};
