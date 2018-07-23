import PropTypes from 'prop-types';
import React from 'react';

import { isBrowser } from '../util/browser';

const LogoSmall = ({ logo, title }, { config }) => {
  if (config.textLogo) {
    return (
      <section className="title">
        <span className="title">{title}</span>
      </section>
    );
  } else if (isBrowser && logo) {
    return <div className="logo" style={{ backgroundImage: `url(${logo})` }} />;
  }
  return <div className="logo" style={{ backgroundImage: 'none' }} />;
};

LogoSmall.propTypes = {
  logo: PropTypes.string,
  title: PropTypes.node,
};

LogoSmall.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default LogoSmall;
