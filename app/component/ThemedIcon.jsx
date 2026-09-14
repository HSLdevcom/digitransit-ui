import React from 'react';
import PropTypes from 'prop-types';
import { Icon as HslFiIconWrapper, Question } from '@hsl-fi/icons';
import { useConfigContext } from '../configurations/ConfigContext';
import SvgIcon from './Icon';

/**
 * ICON_MAP maps a logical icon name to:
 *   - hslFiIcon: the @hsl-fi/icons component (used when iconModeSet === 'hsl')
 *   - fallbackImg: the SVG sprite id (used for all other themes)
 */
const ICON_MAP = {
  Question: { hslFiIcon: Question, fallbackImg: 'icon_info' },
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
function ThemedIcon({ name, ...rest }) {
  const config = useConfigContext();
  const { hslFiIcon, fallbackImg } = ICON_MAP[name];

  if (config.iconModeSet === 'hsl') {
    return <HslFiIconWrapper icon={hslFiIcon} {...rest} />;
  }

  return <SvgIcon img={fallbackImg} {...rest} />;
}

ThemedIcon.propTypes = {
  /** Logical icon name — must exist in ICON_MAP */
  name: PropTypes.oneOf(ICON_NAMES).isRequired,
};

export default ThemedIcon;
