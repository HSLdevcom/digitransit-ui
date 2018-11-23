import PropTypes from 'prop-types';
import React from 'react';

import { isBrowser } from '../util/browser';

const LogoSmall = (
  { showLogo, logo, title, subTitle, className },
  { config },
) => {
  if (config.textLogo || !showLogo) {
    return <span className="title">{title}</span>;
  }
  return (
    <div
      className={className}
      style={{ backgroundImage: isBrowser && logo ? `url(${logo})` : 'none' }}
    >
      {title && <span className="logo-title">{title}</span>}
      {subTitle && <span className="logo-sub-title">{subTitle}</span>}
    </div>
  );
};

LogoSmall.propTypes = {
  showLogo: PropTypes.bool,
  logo: PropTypes.string,
  title: PropTypes.node,
  subTitle: PropTypes.string,
  className: PropTypes.string,
};

LogoSmall.defaultProps = {
  showLogo: false,
  logo: undefined,
  title: undefined,
  subTitle: undefined,
  className: 'logo',
};

LogoSmall.contextTypes = {
  config: PropTypes.shape({
    textLogo: PropTypes.bool.isRequired,
  }).isRequired,
};

export default LogoSmall;
