/* eslint-disable dot-notation */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import i18next from 'i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';

i18next.init({
  lng: 'fi',
  fallbackLng: 'fi',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});

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

function OriginToDestination({ showTitle, language }) {
  i18next.changeLanguage(language);
  return (
    <div id="OriginToDestination">
      {showTitle && <span>{i18next.t('title-origin-to-destination')}</span>}
      {showTitle && <br />}
      <input
        className={styles['input']}
        placeholder={i18next.t('placeholder-origin')}
      />
      <br />
      <input
        className={styles['input']}
        placeholder={i18next.t('placeholder-destination')}
      />
    </div>
  );
}

OriginToDestination.propTypes = {
  showTitle: PropTypes.bool,
  language: PropTypes.string,
};

OriginToDestination.defaultProps = {
  showTitle: false,
  language: 'fi',
};

/**
 * Show button links to near you page for different travel modes
 *
 * @param {Object} props
 * @param {string[]} props.modeArray - Names of transport modes to show buttons for. Should be in lower case. Also defines button order
 * @param {string} props.language - Language used for accessible labels
 * @param {string} props.urlPrefix - URL prefix for links. Must end with /lahellasi
 * @param {boolean} props.showTitle - Show title, default is false
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
 *      showTitle
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
];

function getIconName(mode, modeSet) {
  return modeSet === 'default' ? `mode-${mode}` : `mode-${modeSet}-${mode}`;
}

function NearStopsAndRoutes({
  modeArray,
  urlPrefix,
  language,
  showTitle,
  alertsContext,
  LinkComponent,
  origin,
  omitLanguageUrl,
  onClick,
  buttonStyle,
  title,
  modes,
  modeSet,
  modeIconColors,
  fontWeights,
}) {
  const [modesWithAlerts, setModesWithAlerts] = useState([]);

  useEffect(() => {
    i18next.changeLanguage(language);
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

      const modeButton = !modes ? (
        <>
          <span className={styles['sr-only']}>
            {i18next.t(`pick-mode-${mode}`, { lng: language })}
          </span>
          <span className={styles['transport-mode-icon-container']}>
            <span className={styles['transport-mode-icon-with-icon']}>
              <Icon
                img={mode === 'favorite' ? 'star' : getIconName(mode, modeSet)}
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
        <>
          <span className={styles['sr-only']}>
            {i18next.t(`pick-mode-${mode}`, { lng: language })}
          </span>
          <span className={styles['transport-mode-icon-container']}>
            <span
              className={styles['transport-mode-icon-with-icon']}
              style={{
                '--bckColor': `${
                  modes[mode]['color']
                    ? modes[mode]['color']
                    : modeIconColors[`mode-${mode}`] || buttonStyle['color']
                }`,
                '--borderRadius': `${buttonStyle.borderRadius}`,
              }}
            >
              <Icon img={getIconName(mode, modeSet)} />
              {withAlert && (
                <span className={styles['transport-mode-alert-icon']}>
                  <Icon img="caution" color="#dc0451" />
                </span>
              )}
            </span>
            <span className={styles['transport-mode-title']}>
              {modes[mode]['nearYouLabel'][language]}
            </span>
          </span>
        </>
      );

      if (onClick) {
        return (
          <div
            key={mode}
            role="link"
            tabIndex="0"
            onKeyDown={e => onClick(url, e)}
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
      {showTitle && (
        <h2 className={styles['near-you-title']}>
          {!modes
            ? i18next.t('title-route-stop-station', { lng: language })
            : title[language]}
        </h2>
      )}
      <div
        className={
          !modes
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
  urlPrefix: PropTypes.string.isRequired,
  language: PropTypes.string,
  showTitle: PropTypes.bool,
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
  title: PropTypes.objectOf(PropTypes.string),
  modes: PropTypes.object,
  modeIconColors: PropTypes.objectOf(PropTypes.string),
  modeSet: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
};

NearStopsAndRoutes.defaultProps = {
  showTitle: false,
  language: 'fi',
  LinkComponent: undefined,
  origin: undefined,
  omitLanguageUrl: undefined,
  buttonStyle: undefined,
  alertsContext: undefined,
  onClick: undefined,
  title: undefined,
  modes: undefined,
  modeIconColors: {
    'mode-bus': '#007ac9',
    'mode-rail': '#8c4799',
    'mode-tram': '#008151',
    'mode-metro': '#ed8c00',
    'mode-ferry': '#007A97',
    'mode-citybike': '#F2B62D',
  },
  modeSet: 'default',
  fontWeights: {
    medium: 500,
  },
};

/**
 * CtrlPanel gathers multiple components to same area (desktop-size: left or mobile-size: bottom)
 *
 * @example
 * <CtrlPanel language="fi" position="left">
 *    <CtrlPanel.OriginToDestination showTitle />
 *    <CtrlPanel.SeparatorLine />
 *    <CtrlPanel.NearStopsAndRoutes
 *      modearray={['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike']}
 *      language="fi"
 *      urlPrefix="http://example.com/lahellasi"
 *      showTitle
 *    />
 *  </CtrlPanel>
 */
class CtrlPanel extends React.Component {
  static NearStopsAndRoutes = NearStopsAndRoutes;

  static OriginToDestination = OriginToDestination;

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

  constructor(props) {
    super(props);
    Object.keys(translations).forEach(lang => {
      i18next.addResourceBundle(lang, 'translation', translations[lang]);
    });
  }

  render() {
    const className =
      this.props.position === 'bottom'
        ? styles['main-bottom']
        : styles['main-left'];
    return (
      <div
        key="main"
        className={className}
        style={{ '--font-weight-medium': this.props.fontWeights.medium }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default CtrlPanel;
