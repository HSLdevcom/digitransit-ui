/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prefer-stateless-function */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@digitransit-component/digitransit-component-icon';
import i18next from 'i18next';
import translations from './helpers/translations';
import styles from './helpers/styles.scss';

i18next.init({
  lng: 'fi',
  fallbackLng: 'fi',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});

/**
 * A banner with blue caution Icon and arrow mark, original purpose is to act as a link to a page about current traffic information.
 *
 * @example
 *   handleClick = (e, lang) => {
    e.preventDefault();
    window.location = 'www.digitransit.fi';
  };
  const lang = "fi"
 * <TrafficNowLink lang={lang} handleClick={this.handleClick}/>
 */
class TrafficNowLink extends React.Component {
  static propTypes = {
    /** Required. Function to handle when the banner is clicked. Also for KeyDown events */
    handleClick: PropTypes.func.isRequired,
    /* Language. Supported languages are en, sv, fi */
    lang: PropTypes.string,
    /* href. if provided show <a> link  */
    href: PropTypes.string,
    /** Optional. */
    fontWeights: PropTypes.shape({
      /** Default value is 500. */
      medium: PropTypes.number,
    }),
  };

  static defaultProps = {
    lang: 'fi',
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

  componentDidUpdate = () => {
    if (i18next.language !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }
  };

  handleKeyDown = (e, lang) => {
    if (e.keyCode === 32 || e.keyCode === 13) {
      this.props.handleClick(e, lang);
    }
  };

  render() {
    const { lang, fontWeights } = this.props;
    i18next.changeLanguage(lang);
    return (
      <h2 className={styles.container}>
        <div
          className={styles.banner}
          tabIndex="0"
          role="button"
          onClick={e => this.props.handleClick(e, lang)}
          onKeyDown={e => this.handleKeyDown(e, lang)}
          style={{ '--font-weight-medium': fontWeights.medium }}
        >
          <div className={styles.caution}>
            {' '}
            <Icon
              img="caution-white"
              color="#DC0451"
              height={1.375}
              width={1.25}
            />{' '}
            <a className={styles.text} href={this.props.href}>
              {i18next.t('traffic')}
            </a>
          </div>

          <span>
            <Icon width={0.8125} height={1.1875} img="arrow" color="#007ac9" />
          </span>
        </div>
      </h2>
    );
  }
}

export default TrafficNowLink;
