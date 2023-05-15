import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import { isBrowser } from '../util/browser';

const LogoSmall = ({ logo, title }, { config }) => {
  if (config.textLogo && !logo) {
    return (
      <span className="title" role="heading" aria-level="1">
        {title}
      </span>
    );
  }
  if (logo && config.textLogo && title) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img style={{ height: '40px', width: '40px' }} src={logo} alt="logo" />
        <span
          className={cx('title', { 'with-logo': true })}
          role="heading"
          aria-level="1"
        >
          {title}
        </span>
      </div>
    );
  }

  return (
    <div
      className="logo"
      style={{ backgroundImage: isBrowser && logo ? `url(${logo})` : 'none' }}
    />
  );
};

LogoSmall.propTypes = {
  logo: PropTypes.string,
  title: PropTypes.node,
};

LogoSmall.defaultProps = {
  logo: undefined,
  title: undefined,
};

LogoSmall.contextTypes = {
  config: PropTypes.shape({
    textLogo: PropTypes.bool.isRequired,
  }).isRequired,
};

export default LogoSmall;
