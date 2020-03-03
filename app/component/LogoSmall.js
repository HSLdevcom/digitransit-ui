import PropTypes from 'prop-types';
import React from 'react';

import { isBrowser } from '../util/browser';

const LogoSmall = (
  { showLogo, showTitles, logo, title, subTitle, className },
  { config },
) => {
  if (config.textLogo || !showLogo) {
    return (
      <span className="title" role="heading" aria-level="1">
        {title}
      </span>
    );
  }
  return (
    <div
      className={className}
      style={{ backgroundImage: isBrowser && logo ? `url(${logo})` : 'none' }}
    >
      {showTitles && title && <span className="logo-title">{title}</span>}
      {showTitles &&
        subTitle && <span className="logo-sub-title">{subTitle}</span>}
    </div>
  );
};

LogoSmall.propTypes = {
  showLogo: PropTypes.bool,
  showTitles: PropTypes.bool,
  logo: PropTypes.string,
  title: PropTypes.node,
  subTitle: PropTypes.string,
  className: PropTypes.string,
};

LogoSmall.defaultProps = {
  showLogo: false,
  showTitles: false,
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
