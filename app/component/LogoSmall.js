import PropTypes from 'prop-types';
import React from 'react';

import { isBrowser } from '../util/browser';

const LogoSmall = ({ showLogo, logo, title }, { config }) => {
  if (config.textLogo || !showLogo) {
    return <span className="title">{title}</span>;
  }
  if (isBrowser && logo) {
    return <div className="logo" style={{ backgroundImage: `url(${logo})` }} />;
  }
  return <div className="logo" style={{ backgroundImage: 'none' }} />;
};

LogoSmall.propTypes = {
  showLogo: PropTypes.bool,
  logo: PropTypes.string,
  title: PropTypes.node,
};

LogoSmall.defaultProps = {
  showLogo: false,
  logo: undefined,
  title: undefined,
};

LogoSmall.contextTypes = {
  config: PropTypes.shape({
    textLogo: PropTypes.bool.isRequired,
  }).isRequired,
};

export default LogoSmall;
