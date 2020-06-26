/* eslint-disable dot-notation */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import i18next from 'i18next';
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

function NearStopsAndRoutes({ buttons, showTitle, language }) {
  i18next.changeLanguage(language);
  return (
    <div id="NearStopsAndRoutes">
      {showTitle && <span>{i18next.t('title-route-stop-station')}</span>}
      {showTitle && <br />}
      {buttons.length > 0 && (
        <div role="group" arial-label={i18next.t('pick-mode')}>
          {/* buttons.map(button => <button key={button}>{i18next.t(`pick-mode-${button}`)}</button>) */}
          {buttons.map(button => {
            let h = 1.5;
            let w = 1.5;
            let c;
            if (button === 'subway') {
              h = 1.6;
              w = 1.6;
              c = '#ff6319';
            }
            return (
              <Icon
                key={button}
                img={`icon-icon_${button}`}
                height={h}
                width={w}
                margin={0.5}
                color={c}
              />
            );
          })}
        </div>
      )}
      <input
        className={styles['input']}
        placeholder={i18next.t('placeholder-route-stop-station')}
      />
      <br />
    </div>
  );
}

NearStopsAndRoutes.propTypes = {
  buttons: PropTypes.array,
  showTitle: PropTypes.bool,
  language: PropTypes.string,
};

NearStopsAndRoutes.defaultProps = {
  buttons: [],
  showTitle: false,
  language: 'fi',
};

function Icon({ color, img, height, width, margin }) {
  return (
    <span aria-hidden className="icon-container">
      <svg
        style={{
          fill: color || null,
          height: height ? `${height}em` : null,
          width: width ? `${width}em` : null,
          marginRight: margin ? `${margin}em` : null,
        }}
      >
        <use xlinkHref={`#${img}`} />
      </svg>
    </span>
  );
}

Icon.propTypes = {
  color: PropTypes.string,
  height: PropTypes.number,
  img: PropTypes.string.isRequired,
  margin: PropTypes.number,
  width: PropTypes.number,
};

Icon.defaultProps = {
  color: undefined,
  height: undefined,
  margin: undefined,
  width: undefined,
};

/**
 * CtrlPanel gathers multiple components to same area (desktop-size: left or mobile-size: bottom)
 *
 * @example
 * <CtrlPanel language="fi" position="left">
 *    <CtrlPanel.OriginToDestination showTitle />
 *    <CtrlPanel.SeparatorLine />
 *    <CtrlPanel.NearStopsAndRoutes
 *      showTitle
 *      buttons={['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike']}
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
