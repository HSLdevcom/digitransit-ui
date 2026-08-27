import React from 'react';
import PropTypes from 'prop-types';
import {
  BusStop,
  CitybikeStation,
  Ferry,
  Metro,
  Question,
  Scooter,
  SpeedtramStop,
  Stop,
  TrainStop,
  TramStop,
} from '@hsl-fi/icons';
import { useConfigContext } from '../configurations/ConfigContext';
import SvgIcon from './Icon';

/**
 * ICON_MAP maps a logical icon name to its @hsl-fi/icons component and non-HSL sprite id.
 */
const ICON_MAP = {
  Question: { hslFiIcon: Question, fallbackImg: 'icon_info' },
  BusStop: { hslFiIcon: BusStop, fallbackImg: 'icon_bus-lollipop' },
  TramStop: { hslFiIcon: TramStop, fallbackImg: 'icon_tram-lollipop' },
  TrainStop: { hslFiIcon: TrainStop, fallbackImg: 'icon_rail-lollipop' },
  MetroStop: { hslFiIcon: Metro, fallbackImg: 'icon_subway' },
  FerryStop: { hslFiIcon: Ferry, fallbackImg: 'icon_ferry-lollipop' },
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
 *   - HSL theme (iconModeSet === 'hsl'): uses @hsl-fi/icons SVG components directly
 *   - All other themes: falls back to the SVG sprite via Icon.js
 *
 * This component is the single place responsible for @hsl-fi/icons imports.
 * Usage sites should never import from @hsl-fi/icons directly.
 *
 * customColor: hex color applied to the icon. For HSL icons this maps to the
 * CSS custom property pattern; for SVG sprite icons it maps to the color prop.
 */
function ThemedIcon({ name, customColor, style, ...rest }) {
  const config = useConfigContext();
  const { hslFiIcon, fallbackImg } = ICON_MAP[name];

  if (config.iconModeSet === 'hsl') {
    const HslIcon = hslFiIcon;
    return (
      <HslIcon
        color={customColor ? 'custom' : undefined}
        style={
          customColor ? { '--color-icon-custom': customColor, ...style } : style
        }
        {...rest}
      />
    );
  }

  return (
    <SvgIcon img={fallbackImg} color={customColor} style={style} {...rest} />
  );
}

ThemedIcon.propTypes = {
  /** Logical icon name — must exist in ICON_MAP */
  name: PropTypes.oneOf(ICON_NAMES).isRequired,
  /** Optional hex color; translated to the correct API for each theme */
  customColor: PropTypes.string,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

export default ThemedIcon;
