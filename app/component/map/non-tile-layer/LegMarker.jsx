import PropTypes from 'prop-types';
import React from 'react';
import Marker from 'react-leaflet/es/Marker';
import { default as L } from 'leaflet';
import cx from 'classnames';
import Icon from '../../Icon';
import { legShape } from '../../../../utils/client/shapes';
import { renderAsString } from '../../../../utils/client/mapIconUtils';
import { useConfigContext } from '../../../client/ConfigContext';

// An arrow marker will be displayed if the normal marker can't fit
export default function LegMarker({
  leg,
  mode,
  color = 'currentColor',
  zIndexOffset,
  wide = false,
  style,
  appendClass,
}) {
  const config = useConfigContext();
  const className = wide ? 'wide' : '';
  const iconName = mode === 'bus-express' ? 'icon_bus' : `icon_${mode}`;
  // Do not display route number if it is an external route and the route number is empty.
  const displayRouteNumber = !(
    config.externalFeedIds !== undefined &&
    mode.includes('external') &&
    leg.name === ''
  );
  const routeNumber = displayRouteNumber
    ? `<span class="map-route-number ${mode}" aria-hidden="true">${
        leg.name
      }</span>
         <span class="sr-only">${leg.name.toLowerCase()}</span>`
    : '';

  return (
    <div>
      <Marker
        key={`${leg.name}_text`}
        position={{
          lat: leg.lat,
          lng: leg.lon,
        }}
        interactive={false}
        icon={L.divIcon({
          html: `
            <div class="${className}" style="--background-color: ${color}">
            ${renderAsString(
              <Icon img={iconName} className="map-route-icon" color={color} />,
            )}
              ${routeNumber}
            </div>`,
          className: cx(
            style ? `arrow-${style}` : 'legmarker',
            mode,
            { 'only-icon': !displayRouteNumber },
            appendClass,
          ),
          iconSize: null,
        })}
        zIndexOffset={zIndexOffset}
        keyboard={false}
      />
    </div>
  );
}

LegMarker.propTypes = {
  leg: legShape.isRequired,
  mode: PropTypes.string.isRequired,
  color: PropTypes.string,
  zIndexOffset: PropTypes.number,
  wide: PropTypes.bool,
  style: PropTypes.string,
  appendClass: PropTypes.string,
};
