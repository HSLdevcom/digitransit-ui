/* eslint-disable jsx-a11y/click-events-have-key-events */
import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@digitransit-component/digitransit-component-icon';
import i18next from 'i18next';
import translations from './helpers/translations';
import styles from './helpers/styles.scss';

Object.keys(translations).forEach(l =>
  i18next.addResourceBundle(l, 'translation', translations[l], true),
);

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
const TrafficNowLink = ({ lang, handleClick, href, fontWeights }) => {
  const handleKeyDown = e => {
    if (e.keyCode === 32 || e.keyCode === 13) {
      handleClick(e, lang);
    }
  };

  return (
    <h2 className={styles.container}>
      <div
        className={styles.banner}
        tabIndex="0"
        role="button"
        onClick={e => handleClick(e, lang)}
        onKeyDown={e => handleKeyDown(e)}
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
          <a className={styles.text} href={href}>
            {i18next.t('traffic', { lng: lang })}
          </a>
        </div>
        <span>
          <Icon width={0.8125} height={1.1875} img="arrow" color="#007ac9" />
        </span>
      </div>
    </h2>
  );
};

TrafficNowLink.propTypes = {
  /* Function to handle when the banner is clicked. Also for KeyDown events */
  handleClick: PropTypes.func.isRequired,
  /* Language. Supported languages are en, sv, fi */
  lang: PropTypes.string.isRequired,
  /* href. if provided show <a> link  */
  href: PropTypes.string,
  fontWeights: PropTypes.shape({
    /** Default value is 500. */
    medium: PropTypes.number,
  }),
};

TrafficNowLink.defaultProps = {
  href: undefined,
  fontWeights: {
    medium: 500,
  },
};

export default TrafficNowLink;
