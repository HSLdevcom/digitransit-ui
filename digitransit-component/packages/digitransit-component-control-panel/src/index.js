/* eslint-disable dot-notation */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
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
 * @param {string} props.urlPrefix - URL prefix for links. Must end with /lahellasi
 * @param {boolean} props.title - Custom titles per language
 * @param {Object} props.alertsContext
 * @param {function} props.alertsContext.getModesWithAlerts - Function which should return an array of transport modes that have active alerts (e.g. [BUS, SUBWAY])
 * @param {Number} props.alertsContext.currentTime - Time stamp with which the returned alerts are validated with
 * @param {Number} props.alertsContext.feedIds - feedIds for which the alerts are fetched for
 * @param {element} props.LinkComponent - React component for creating a link, default is undefined and normal anchor tags are used
 * @param {element} props.modeIconColors - object of mode icon colors used for transport mode icons
 *
 * @example
 * const alertsContext = {
 *    getModesWithAlerts: () => ({}),
 *    currentTime: 123456789,
 *    feedIds: [HSL]
 * }
 * <CtrlPanel.NearStopsAndRoutes
 *      modeArray={['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike']}
 *      language="fi"
 *      urlPrefix="http://example.com/lahellasi"
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

function getIconName(mode, modeSet, horizontal) {
  const theme = noTheme.includes(mode) ? '' : `-${modeSet}`;
  const fill = horizontal ? '' : '-fill'; // do not render boxed icon for vertical
  return `${mode}${fill}${theme}`;
}

function NearStopsAndRoutes({
  horizontal,
  modeArray,
  urlPrefix,
  language,
  title,
  alertsContext,
  LinkComponent,
  origin,
  omitLanguageUrl,
  onClick,
  buttonStyle,
  modeSet,
  modeIconColors,
  fontWeights,
}) {
  const [modesWithAlerts, setModesWithAlerts] = useState([]);
  const [t] = useTranslation();

  useEffect(() => {
    if (alertsContext) {
      alertsContext
        .getModesWithAlerts(alertsContext.currentTime, alertsContext.feedIds)
        .then(res => {
          setModesWithAlerts(res);
        });
    }
  }, []);

  let urlStart;
  if (omitLanguageUrl) {
    urlStart = urlPrefix;
  } else {
    const urlParts = urlPrefix.split('/');
    urlParts.splice(urlParts.length - 1, 0, language);
    urlStart = urlParts.join('/');
  }
  const buttons = modeArray
    .filter(mode => validNearYouModes.includes(mode))
    .map(mode => {
      const withAlert = modesWithAlerts.includes(mode.toUpperCase());
      let url = `${urlStart}/${mode.toUpperCase()}/POS`;
      if (origin.lat && origin.lon) {
        url += `/${encodeURIComponent(origin.address)}::${origin.lat},${
          origin.lon
        }`;
      }

      const modeButton = horizontal ? (
        <>
          <span className={styles['sr-only']}>
            {t(mode, { lng: language })}
          </span>
          <span className={styles['transport-mode-icon-container']}>
            <span className={styles['transport-mode-icon-with-icon']}>
              <Icon
                img={
                  mode === 'favorite'
                    ? 'star'
                    : getIconName(mode, modeSet, true)
                }
                color={modeIconColors[`mode-${mode}`]}
              />
              {withAlert && (
                <span className={styles['transport-mode-alert-icon']}>
                  <Icon img="caution" color="#dc0451" />
                </span>
              )}
            </span>
          </span>
        </>
      ) : (
        <span className={styles['transport-mode-icon-container']}>
          <span
            className={styles['transport-mode-icon-with-icon']}
            style={{
              '--bckColor': modeIconColors[`mode-${mode}`],
              '--borderRadius': buttonStyle.borderRadius,
            }}
          >
            <Icon img={getIconName(mode, modeSet, false)} />
            {withAlert && (
              <span className={styles['transport-mode-alert-icon']}>
                <Icon img="caution" color="#dc0451" />
              </span>
            )}
          </span>
          <span className={styles['transport-mode-title']}>
            {t(mode, { lng: language })}
          </span>
        </span>
      );

      if (onClick) {
        return (
          <div
            key={mode}
            role="link"
            tabIndex="0"
            onKeyDown={e => {
              if (isKeyboardSelectionEvent(e)) {
                onClick(url, e);
              }
            }}
            onClick={() => onClick(url)}
          >
            {modeButton}
          </div>
        );
      }
      if (LinkComponent) {
        return (
          <LinkComponent to={url} key={mode}>
            {modeButton}
          </LinkComponent>
        );
      }
      return (
        <a href={url} key={mode}>
          {modeButton}
        </a>
      );
    });

  return (
    <div
      className={styles['near-you-container']}
      style={{ '--font-weight-medium': fontWeights.medium }}
    >
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
        {buttons}
      </div>
    </div>
  );
}

NearStopsAndRoutes.propTypes = {
  modeArray: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.objectOf(PropTypes.string),
  urlPrefix: PropTypes.string.isRequired,
  language: PropTypes.string,
  horizontal: PropTypes.bool,
  alertsContext: PropTypes.shape({
    getModesWithAlerts: PropTypes.func,
    currentTime: PropTypes.number,
    feedIds: PropTypes.arrayOf(PropTypes.string),
  }),
  LinkComponent: PropTypes.object,
  origin: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  omitLanguageUrl: PropTypes.bool,
  onClick: PropTypes.func,
  buttonStyle: PropTypes.objectOf(PropTypes.string),
  modeIconColors: PropTypes.objectOf(PropTypes.string),
  modeSet: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
};

NearStopsAndRoutes.defaultProps = {
  horizontal: true,
  language: 'fi',
  LinkComponent: undefined,
  origin: undefined,
  omitLanguageUrl: undefined,
  buttonStyle: undefined,
  alertsContext: undefined,
  onClick: undefined,
  title: undefined,
  modeIconColors: {
    'mode-airplane': '#0046ad',
    'mode-bus': '#007ac9',
    'mode-rail': '#8c4799',
    'mode-tram': '#008151',
    'mode-subway': '#ed8c00',
    'mode-ferry': '#007A97',
    'mode-citybike': '#F2B62D',
    'mode-bikepark': '#f2b62d',
    'mode-carpark': '#007ac9',
  },
  modeSet: 'hsl',
  fontWeights: {
    medium: 500,
  },
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
 *      urlPrefix="http://example.com/lahellasi"
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
          style={{ '--font-weight-medium': this.props.fontWeights.medium }}
        >
          {this.props.children}
        </div>
      </I18nextProvider>
    );
  }
}

export default CtrlPanel;
