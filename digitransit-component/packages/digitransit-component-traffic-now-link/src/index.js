/* eslint-disable jsx-a11y/click-events-have-key-events */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import i18n from './helpers/i18n';
import styles from './helpers/styles.scss';

/**
 * A banner with blue icon and arrow mark, original purpose is to act as a link to a page about current traffic information.
 *
 * @example
 *   handleClick = (e, lang) => {
    e.preventDefault();
    window.location = 'www.digitransit.fi';
  };
  const lang = "fi"
 * <TrafficNowLink lang={lang} handleClick={this.handleClick}/>
 */
const TrafficNowLink = ({ lang, handleClick, href }) => {
  const [t] = useTranslation();

  const onClick = e => {
    handleClick(e, lang);
  };

  return (
    <a className={styles.container} href={href} onClick={onClick}>
      <div className={styles.leftColumn}>
        <Icon
          img="info-filled"
          color="#007ac9"
          height={1.5}
          width={1.5}
          colorAsFillOnly={false}
        />
        <div className={styles.body}>
          <h2>{t('traffic-now', { lng: lang })}</h2>
          <p>{t('traffic-now_description', { lng: lang })}</p>
        </div>
      </div>
      <span className={styles.caret}>
        <Icon img="arrow" color="#007ac9" width={0.8125} height={1.1875} />
      </span>
    </a>
  );
};

TrafficNowLink.propTypes = {
  /* Function to handle when the banner is clicked. Also for KeyDown events */
  handleClick: PropTypes.func.isRequired,
  /* Language. Supported languages are en, sv, fi */
  lang: PropTypes.string.isRequired,
  /* href. if provided show <a> link  */
  href: PropTypes.string,
};

TrafficNowLink.defaultProps = {
  href: undefined,
};

export default props => (
  <I18nextProvider i18n={i18n}>
    <TrafficNowLink {...props} />
  </I18nextProvider>
);
