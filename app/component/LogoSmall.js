import PropTypes from 'prop-types';
import React from 'react';

import { isBrowser } from '../util/browser';

const LogoSmall = ({ logo, title }, { config }) => {
  if (config.textLogo && !logo) {
    return (
      <span className="title" role="heading" aria-level="1">
        {title}
      </span>
    );
  }
  return (
    <div
      className="logo"
      style={{ backgroundImage: isBrowser && logo ? `url(${logo})` : 'none' }}
    >
      {config.textLogo && title && (
        <span className="title" role="heading" aria-level="1">
          {title}
        </span>
      )}
    </div>
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
