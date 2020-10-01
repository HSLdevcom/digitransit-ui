/* eslint-disable dot-notation */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import i18next from 'i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import cx from 'classnames';
import Modal from '@hsl-fi/modal';
import { routerShape } from 'found';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';

i18next.init({ lng: 'en', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

function SeparatorLine({ usePaddingBottom20 }) {
  const className = usePaddingBottom20
    ? styles['separator-div2']
    : styles['separator-div'];
  return (
    <div id="SeparatorDiv" className={className}>
      <div id="SeparatorLine" className={styles['separator-line']} />
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
 * @param {string[]} props.modes - Names of transport modes to show buttons for. Should be in lower case. Also defines button order
 * @param {string} props.language - Language used for accessible labels
 * @param {string} props.urlPrefix - URL prefix for links. Must end with /lahellasi
 * @param {boolean} props.showTitle - Show title, default is false
 *
 * @example
 * <CtrlPanel.NearStopsAndRoutes
 *      modes={['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike']}
 *      language="fi"
 *      urlPrefix="http://example.com/lahellasi"
 *      showTitle
 *    />
 *
 */
function NearStopsAndRoutes({
  modes,
  urlPrefix,
  language,
  showTitle,
  autosuggestComponent,
  router,
  checkPositioningPermission,
  origin,
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState(undefined);
  const [selectedMode, setMode] = useState('');
  const [isGeolocationGranted, setGeolocationPermission] = useState(false);
  const [geolocationStatus, setGeolocationStatus] = useState(undefined);

  const checkGeolocationPermission = () => {
    checkPositioningPermission().then(status => {
      setGeolocationStatus(status.state);
      if (status.state === 'granted') {
        setGeolocationPermission(true);
      }
    });
  };

  checkGeolocationPermission();

  const createUrl = (mode, useCurrentLocation) => {
    let newUrl = `${urlPrefix}/${mode.toUpperCase()}/`;
    if (useCurrentLocation) {
      newUrl += 'POS';
    } else {
      newUrl += `${encodeURIComponent(origin.address)}::${origin.lat},${
        origin.lon
      }`;
    }
    if (origin.queryString) {
      newUrl += origin.queryString;
    }
    return newUrl;
  };

  const showDialog = (e, mode, showModal) => {
    e.preventDefault();
    if (showModal && !origin.set) {
      setDialogOpen(true);
      setUrl(createUrl(mode, true));
      setMode(mode);
    } else if (showModal && origin.set) {
      router.replace(createUrl(mode, false));
    } else {
      router.replace(createUrl(mode, true));
    }
  };

  const icon = <Icon img="locate" height={1.375} width={1.375} />;

  const renderDialogModal = () => {
    const autosuggestComponentWithMode = React.cloneElement(
      autosuggestComponent,
      { mode: selectedMode },
    );
    return (
      <Modal
        appElement="#app"
        contentLabel="content label"
        closeButtonLabel="sulje"
        variant="small"
        isOpen={isDialogOpen}
        onCrossClick={() => {
          setDialogOpen(false);
        }}
      >
        <div className={styles['modal-desktop-container']}>
          <div className={styles['modal-desktop-top']}>
            <div className={styles['modal-desktop-header']}>
              {i18next.t('stop-near-you-modal-header')}
            </div>
          </div>
          <div className={styles['modal-desktop-text']}>
            {i18next.t('stop-near-you-modal-info')}
          </div>
          <div
            className={cx(`${styles['modal-desktop-text']} ${styles.title}`)}
          >
            {i18next.t('placeholder-origin')}
          </div>
          <div className={styles['modal-desktop-main']}>
            <div className={styles['modal-desktop-location-search']}>
              {autosuggestComponentWithMode}
            </div>
          </div>
          <div
            className={cx(`${styles['modal-desktop-text']} ${styles.title2}`)}
          >
            {i18next.t('stop-near-you-modal-grant-permission')}
          </div>
          {geolocationStatus === 'prompt' && (
            <div className={styles['modal-desktop-buttons']}>
              <button
                type="submit"
                className={cx(
                  `${styles['modal-desktop-button']} ${styles.save}`,
                )}
                onClick={() => router.replace(url)}
              >
                {icon}
                {i18next.t('use-own-position')}
              </button>
            </div>
          )}
          {geolocationStatus === 'denied' && (
            <div
              className={cx(`${styles['modal-desktop-text']} ${styles.info}`)}
            >
              {i18next.t('stop-near-you-modal-grant-permission-info')}
            </div>
          )}
        </div>
      </Modal>
    );
  };

  const buttons = modes.map(mode => {
    return (
      <a
        href={url}
        key={mode}
        onClick={e => showDialog(e, mode.toUpperCase(), !isGeolocationGranted)}
      >
        <span className={styles['sr-only']}>
          {i18next.t(`pick-mode-${mode}`, { lng: language })}
        </span>
        <span className={styles['transport-mode-icon-container']}>
          <Icon img={`mode-${mode}`} />
        </span>
      </a>
    );
  });

  return (
    <div className={styles['near-you-container']}>
      {showTitle && (
        <h2 className={styles['near-you-title']}>
          {i18next.t('title-route-stop-station', { lng: language })}
        </h2>
      )}
      <div className={styles['near-you-buttons-container']}>{buttons}</div>
      {renderDialogModal()}
    </div>
  );
}

NearStopsAndRoutes.propTypes = {
  modes: PropTypes.arrayOf(PropTypes.string).isRequired,
  urlPrefix: PropTypes.string.isRequired,
  language: PropTypes.string,
  showTitle: PropTypes.bool,
  autosuggestComponent: PropTypes.node.isRequired,
  router: routerShape.isRequired,
  checkPositioningPermission: PropTypes.func.isRequired,
  origin: PropTypes.object,
};

NearStopsAndRoutes.defaultProps = {
  showTitle: false,
  language: 'fi',
};

/**
 * CtrlPanel gathers multiple components to same area (desktop-size: left or mobile-size: bottom)
 *
 * @example
 * <CtrlPanel language="fi" position="left">
 *    <CtrlPanel.OriginToDestination showTitle />
 *    <CtrlPanel.SeparatorLine />
 *    <CtrlPanel.NearStopsAndRoutes
 *      modes={['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike']}
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
    children: PropTypes.node,
    language: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
  };

  static defaultProps = {
    children: [],
  };

  render() {
    const className =
      this.props.position === 'bottom'
        ? styles['main-bottom']
        : styles['main-left'];
    const children = React.Children.map(this.props.children, child => {
      if (child) {
        let lang = this.props.language;
        if (lang === undefined) {
          lang = 'fi';
        }
        i18next.changeLanguage(lang);
        return React.cloneElement(child, { lang });
      }
      return null;
    });
    return (
      <Fragment>
        <div key="main" className={className}>
          {children}
        </div>
      </Fragment>
    );
  }
}

export default CtrlPanel;
