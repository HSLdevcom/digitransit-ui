/* eslint-disable dot-notation */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { defaultColors } from '@digitransit-component/digitransit-component-icon';
import Shimmer from '@hsl-fi/shimmer';
import NearYouButton from './helpers/NearYouButton';
import AllModesModal from './helpers/AllModesModal';
import styles from './helpers/styles.scss';
import i18n from './helpers/i18n';

const isKeyboardSelectionEvent = event => {
  const space = [13, ' ', 'Spacebar'];
  const enter = [32, 'Enter'];
  const key = (event && (event.key || event.which || event.keyCode)) || '';

  if (!key || !space.concat(enter).includes(key)) {
    return false;
  }
  event.preventDefault();
  return true;
};

function SeparatorLine({ usePaddingBottom20 }) {
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

SeparatorLine.defaultProps = {
  usePaddingBottom20: false,
};

/**
 * Show button links to near you page for different travel modes
 *
 * @param {Object} props
 * @param {string[]} props.modeArray - Names of transport modes to show buttons for. Should be in lower case. Also defines button order
 * @param {string} props.language - Language used for accessible labels
 * @param {boolean} props.title - Custom titles per language
 * @param {Object} props.alertsContext
 * @param {function} props.alertsContext.getModesWithAlerts - Function which should return an array of transport modes that have active alerts (e.g. [BUS, SUBWAY])
 * @param {Number} props.alertsContext.currentTime - Time stamp with which the returned alerts are validated with
 * @param {Number} props.alertsContext.feedIds - feedIds for which the alerts are fetched for
 * @param {element} props.colors - theme color configuration
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

const validNearYouModes = [
  'favorite',
  'bus',
  'tram',
  'rail',
  'subway',
  'airplane',
  'ferry',
  'citybike',
  'bikepark',
  'carpark',
];

const noTheme = ['bikepark', 'carpark', 'subway', 'airplane']; // common icon in all themes

function getIconName(mode, modeSet, boxed) {
  const theme = noTheme.includes(mode) ? '' : `-${modeSet}`;
  const fill = boxed ? '' : '-fill'; // do not render boxed icon for vertical
  return `${mode}${fill}${theme}`;
}

const MAX_VISIBLE_MODES = 7;

function NearStopsAndRoutes({
  appElement,
  horizontal,
  modeArray,
  language,
  title,
  alertsContext,
  origin,
  onClick,
  modeSet,
  colors,
  fontWeights,
  isMobile,
  urlPrefix,
  omitLanguageUrl,
  loading,
}) {
  const [modesWithAlerts, setModesWithAlerts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [t] = useTranslation();

  let urlStart;
  if (omitLanguageUrl) {
    urlStart = urlPrefix;
  } else {
    const urlParts = urlPrefix.split('/');
    urlParts.splice(urlParts.length - 1, 0, language);
    urlStart = urlParts.join('/');
  }

  useEffect(() => {
    if (alertsContext) {
      alertsContext
        .getModesWithAlerts(alertsContext.currentTime, alertsContext.feedIds)
        .then(res => {
          setModesWithAlerts(res);
        });
    }
  }, []);

  const urlPostfix =
    origin.lat && origin.lon
      ? `/POS/${encodeURIComponent(origin.address)}::${origin.lat},${
          origin.lon
        }`
      : '/POS';
  const linkedButtonProps = { role: 'link', tabIndex: '0' };

  // line between buttons
  const separator = (
    <div
      className={styles['separator']}
      style={{
        '--margin': isMobile ? '0' : '-5%',
        '--width': isMobile ? '100%' : '110%',
      }}
    />
  );
  const renderButtons = (modes, forModal) =>
    modes.map(mode => {
      const withAlert = modesWithAlerts.includes(mode.toUpperCase());
      const url = `${urlStart}/${mode.toUpperCase()}${urlPostfix}`;
      const boxed = forModal || horizontal; // squared icon or interior only
      const buttonProps = {
        mode,
        modeSet,
        colors,
        withAlert,
        boxed,
        getIconName,
      };

      if (forModal || !horizontal) {
        let key = mode;
        if (forModal) {
          key =
            modeSet === 'hsl' && mode === 'rail'
              ? 'rail_local'
              : `${mode}_short`;
        }
        buttonProps.title = (
          <span
            className={styles['transport-mode-title']}
            style={{ '--font-weight': forModal ? 325 : fontWeights.medium }}
          >
            {t(key, { lng: language })}
          </span>
        );
      }

      if (!forModal) {
        buttonProps.withBorder = true;
      } else {
        buttonProps.withArrow = true;
        buttonProps.margin = '0';
        buttonProps.iconSize = '35px';
        buttonProps.padding = '6px';
      }
      const clickProps =
        mode === 'more'
          ? {
              onKeyDown: e => {
                if (isKeyboardSelectionEvent(e)) {
                  setModalOpen(true);
                }
              },
              onClick: () => setModalOpen(true),
            }
          : {
              onKeyDown: e => {
                if (isKeyboardSelectionEvent(e)) {
                  onClick(url, e);
                }
              },
              onClick: () => onClick(url),
            };

      const button = (
        <div
          aria-label={t(mode, { lng: language })}
          key={mode}
          {...clickProps}
          {...linkedButtonProps}
        >
          <Shimmer active={loading}>
            <NearYouButton {...buttonProps} />
          </Shimmer>
        </div>
      );

      // add separator line into modal button array
      return forModal && mode !== modes[modes.length - 1] ? (
        <div key={mode}>
          {button}
          {separator}
        </div>
      ) : (
        button
      );
    });

  const modes = modeArray.filter(mode => validNearYouModes.includes(mode));
  const useModal = horizontal && modes.length > MAX_VISIBLE_MODES;
  let visibleModes = modes;

  if (useModal) {
    visibleModes = modes.slice(0, MAX_VISIBLE_MODES - 1);
    visibleModes.push('more');
  }

  return (
    <div
      className={styles['near-you-container']}
      style={{ '--font-weight': fontWeights.medium }}
    >
      {useModal && (
        <AllModesModal
          appElement={appElement}
          isMobile={isMobile}
          language={language}
          modalOpen={modalOpen}
          fontWeights={fontWeights}
          closeModal={() => setModalOpen(false)}
          colors={colors}
        >
          {renderButtons(modes, true)}
        </AllModesModal>
      )}
      <h2 className={styles['near-you-title']}>
        {title?.[language] || t('title', { lng: language })}
      </h2>
      <div
        className={
          horizontal
            ? styles['near-you-buttons-container']
            : styles['near-you-buttons-container-wide']
        }
      >
        {renderButtons(visibleModes, false)}
      </div>
    </div>
  );
}

NearStopsAndRoutes.propTypes = {
  loading: PropTypes.bool,
  appElement: PropTypes.string.isRequired,
  modeArray: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.objectOf(PropTypes.string),
  language: PropTypes.string,
  horizontal: PropTypes.bool,
  alertsContext: PropTypes.shape({
    getModesWithAlerts: PropTypes.func,
    currentTime: PropTypes.number,
    feedIds: PropTypes.arrayOf(PropTypes.string),
  }),
  origin: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  onClick: PropTypes.func.isRequired,
  colors: PropTypes.objectOf(PropTypes.string),
  modeSet: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
  isMobile: PropTypes.bool,
  urlPrefix: PropTypes.string.isRequired,
  omitLanguageUrl: PropTypes.bool,
};

NearStopsAndRoutes.defaultProps = {
  loading: true,
  horizontal: true,
  language: 'fi',
  origin: undefined,
  alertsContext: undefined,
  title: undefined,
  colors: defaultColors,
  modeSet: 'hsl',
  fontWeights: { medium: 500 },
  isMobile: false,
  omitLanguageUrl: false,
};

/**
 * CtrlPanel gathers multiple components to same area (desktop-size: left or mobile-size: bottom)
 *
 * @example
 * <CtrlPanel language="fi" position="left">
 *    <CtrlPanel.SeparatorLine />
 *    <CtrlPanel.NearStopsAndRoutes
 *      modearray={['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike']}
 *      language="fi"
 *    />
 *  </CtrlPanel>
 */
class CtrlPanel extends React.Component {
  static NearStopsAndRoutes = NearStopsAndRoutes;

  static SeparatorLine = SeparatorLine;

  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
    position: PropTypes.string.isRequired,
    fontWeights: PropTypes.shape({
      medium: PropTypes.number,
    }),
  };

  static defaultProps = {
    children: [],
    fontWeights: {
      medium: 500,
    },
  };

  render() {
    const className =
      this.props.position === 'bottom'
        ? styles['main-bottom']
        : styles['main-left'];
    return (
      <I18nextProvider i18n={i18n}>
        <div
          key="main"
          className={className}
          style={{ '--font-weight': this.props.fontWeights.medium }}
        >
          {this.props.children}
        </div>
      </I18nextProvider>
    );
  }
}

export default CtrlPanel;
