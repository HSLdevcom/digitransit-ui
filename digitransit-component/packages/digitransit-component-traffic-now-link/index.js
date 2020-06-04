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

i18next.init({ lng: 'en', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);
/**
 * A banner with blue caution Icon and arrow mark, original purpose is to act as a link to a page about current traffic information.
 *
 * @example
 *   handleClick = e => {
    e.preventDefault();
    window.location = 'www.digitransit.fi';
  };
  const lang = "fi"
 * <TrafficNowLink lang={lang} handleClick={this.handleClick}/>
 */
class TrafficNowLink extends React.Component {
  static propTypes = {
    /** Required. Function to handle when the banner is clicked. */
    handleClick: PropTypes.func.isRequired,
    /* Language. Supported languages are en, sv, fi */
    lang: PropTypes.string,
  };

  static defaultProps = {
    lang: 'fi',
  };

  render() {
    i18next.changeLanguage(this.props.lang);

    return (
      <div
        className={styles.banner}
        tabIndex="0"
        role="button"
        onClick={e => this.props.handleClick(e)}
      >
        <div className={styles.caution}>
          {' '}
          <Icon
            img="caution-white"
            color="#007ac9"
            height={1.25}
            width={1.125}
          />{' '}
          <h3 className={styles.text}> {i18next.t('traffic')} </h3>
        </div>

        <span>
          <Icon width={1.25} height={1.125} img="arrow" />
        </span>
      </div>
    );
  }
}

export default TrafficNowLink;
