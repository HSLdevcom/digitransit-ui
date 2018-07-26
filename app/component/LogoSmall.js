import PropTypes from 'prop-types';
import React from 'react';

import { isBrowser } from '../util/browser';

const LogoSmall = ({ showLogo, logo, title }, { config }) => {
  if (config.textLogo || !showLogo) {
    return <span className="title">{title}</span>;
  } else if (isBrowser && logo) {
    return <div className="logo" style={{ backgroundImage: `url(${logo})` }} />;
  }
  return <div className="logo" style={{ backgroundImage: 'none' }} />;
};

LogoSmall.propTypes = {
  showLogo: PropTypes.bool,
  logo: PropTypes.string,
  title: PropTypes.node,
};

LogoSmall.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default LogoSmall;
