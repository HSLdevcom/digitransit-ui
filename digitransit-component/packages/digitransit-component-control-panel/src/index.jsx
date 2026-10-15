import PropTypes from 'prop-types';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import NearStopsAndRoutes from './helpers/NearStopsAndRoutes';
import styles from './helpers/styles.scss';
import i18n from './helpers/i18n';

const DEFAULT_FONT_WEIGHTS = { medium: 500 };
const DEFAULT_CHILDREN = [];

function SeparatorLine({ usePaddingBottom20 = false }) {
  const className = usePaddingBottom20
    ? styles['separator-div2']
    : styles['separator-div'];
  return (
    <div className={className}>
      <div className={styles['separator-line']} />
    </div>
  );
}

SeparatorLine.propTypes = {
  usePaddingBottom20: PropTypes.bool,
};

/**
 * CtrlPanel gathers multiple components to same area (desktop-size: left or mobile-size: bottom)
 *
 * @param {Object} props
 * @param {string} props.position - 'left' or 'bottom'
 * @param {Object} props.fontWeights - font weights, e.g. { medium: 500 }
 * @param {node} props.children - panel content
 * @example
 * <CtrlPanel language="fi" position="left">
 *    <CtrlPanel.SeparatorLine />
 *    <CtrlPanel.NearStopsAndRoutes
 *      modearray={['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike']}
 *      language="fi"
 *    />
 *  </CtrlPanel>
 */
function CtrlPanel({
  children = DEFAULT_CHILDREN,
  position,
  fontWeights = DEFAULT_FONT_WEIGHTS,
}) {
  const className =
    position === 'bottom' ? styles['main-bottom'] : styles['main-left'];
  return (
    <I18nextProvider i18n={i18n}>
      <div
        className={className}
        style={{ '--font-weight': fontWeights.medium }}
      >
        {children}
      </div>
    </I18nextProvider>
  );
}

/**
 * @name CtrlPanel.NearStopsAndRoutes
 * @static
 *
 * Show button links to near you page for different travel modes
 *
 * @param {Object} props
 * @param {string[]} props.modeArray - Names of transport modes to show buttons for. Should be in lower case. Also defines button order
 * @param {string} props.language - Language used for accessible labels
 * @param {Object} props.title - Custom titles per language
 * @param {Object} props.alertsContext
 * @param {function} props.alertsContext.getModesWithAlerts - Function which should return an array of transport modes that have active alerts (e.g. [BUS, SUBWAY])
 * @param {Number} props.alertsContext.currentTime - Time stamp with which the returned alerts are validated with
 * @param {Number} props.alertsContext.feedIds - feedIds for which the alerts are fetched for
 * @param {Object} props.colors - theme color configuration
 * @param {string} props.urlPrefix - URL prefix for links
 * @example
 * const alertsContext = {
 *    getModesWithAlerts: () => ({}),
 *    currentTime: 123456789,
 *    feedIds: [HSL]
 * }
 * <CtrlPanel.NearStopsAndRoutes
 *      modeArray={['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike']}
 *      language="fi"
 *      alertsContext={alertsContext}
 *    />
 *
 */
CtrlPanel.NearStopsAndRoutes = NearStopsAndRoutes;
CtrlPanel.SeparatorLine = SeparatorLine;

CtrlPanel.propTypes = {
  children: PropTypes.node,
  position: PropTypes.string.isRequired,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
};

export default CtrlPanel;
