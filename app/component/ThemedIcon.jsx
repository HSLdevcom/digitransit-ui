import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon as HslFiIconWrapper,
  BusStop,
  CitybikeStation,
  Metro,
  Question,
  Scooter,
  SpeedtramStop,
  Stop,
  TrainStop,
  TramStop,
} from '@hsl-fi/icons';
import { useConfigContext } from '../hooks/ConfigContext';
import SvgIcon from './Icon';

/**
 * ICON_MAP maps a logical icon name to:
 *   - hslFiIcon: the @hsl-fi/icons component (used when iconModeSet === 'hsl')
 *   - fallbackImg: the SVG sprite id (used for all other themes)
 */
const ICON_MAP = {
  Question: { hslFiIcon: Question, fallbackImg: 'icon_info' },
  BusStop: { hslFiIcon: BusStop, fallbackImg: 'icon_bus-lollipop' },
  TramStop: { hslFiIcon: TramStop, fallbackImg: 'icon_tram-lollipop' },
  TrainStop: { hslFiIcon: TrainStop, fallbackImg: 'icon_rail-lollipop' },
  MetroStop: { hslFiIcon: Metro, fallbackImg: 'icon_subway' },
  // TODO: use @hsl-fi/icons once it exports FerryStop
  FerryStop: { fallbackImg: 'icon_ferry-stop' },
  // TODO: use @hsl-fi/icons once it exports FerryExternalStop
  FerryExternalStop: { fallbackImg: 'icon_ferry-external-stop' },
  CitybikeStation: {
    hslFiIcon: CitybikeStation,
    fallbackImg: 'icon_citybike-lollipop',
  },
  ScooterStop: { hslFiIcon: Scooter, fallbackImg: 'icon_scooter-lollipop' },
  SpeedtramStop: {
    hslFiIcon: SpeedtramStop,
    fallbackImg: 'icon_tram-lollipop',
  },
  GenericStop: { hslFiIcon: Stop, fallbackImg: 'icon_bus-lollipop' },
};

const ICON_NAMES = Object.keys(ICON_MAP);

/**
 * ThemedIcon renders the correct icon depending on the active theme:
 *   - HSL theme (iconModeSet === 'hsl'): uses @hsl-fi/icons
 *   - All other themes: falls back to the SVG sprite via Icon.js
 *
 * This component is the single place responsible for @hsl-fi/icons imports.
 * Usage sites should never import from @hsl-fi/icons directly.
 */
function ThemedIcon({ name, size, customColor, className, style, ...rest }) {
  const config = useConfigContext();
  const { hslFiIcon, fallbackImg } = ICON_MAP[name];

  if (config.iconModeSet === 'hsl' && hslFiIcon) {
    // The sized wrapper only supports design-token colors, so custom-colored
    // or CSS-sized icons render the bare icon.
    if (size && !customColor) {
      return (
        <HslFiIconWrapper
          icon={hslFiIcon}
          size={size}
          iconProps={{ className, style }}
          {...rest}
        />
      );
    }
    const HslIcon = hslFiIcon;
    return (
      <HslIcon
        className={className}
        color={customColor ? 'custom' : undefined}
        style={
          customColor ? { '--color-icon-custom': customColor, ...style } : style
        }
        {...rest}
      />
    );
  }

  return (
    <SvgIcon
      img={fallbackImg}
      color={customColor}
      className={className}
      {...rest}
    />
  );
}

ThemedIcon.propTypes = {
  /** Logical icon name — must exist in ICON_MAP */
  name: PropTypes.oneOf(ICON_NAMES).isRequired,
  /** Token size for the @hsl-fi/icons wrapper; omit to size the icon with CSS */
  size: PropTypes.oneOf(['s', 'm', 'l', 'xl']),
  /** CSS color overriding the default icon color */
  customColor: PropTypes.string,
  className: PropTypes.string,
  /** Inline style, applied only to @hsl-fi/icons */
  style: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
};

export default ThemedIcon;
