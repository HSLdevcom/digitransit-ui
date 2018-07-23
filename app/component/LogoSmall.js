import PropTypes from 'prop-types';
import React from 'react';

import { isBrowser } from '../util/browser';

const LogoElement = ({ logo, title }, { config }) => {
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

LogoElement.propTypes = {
  logo: PropTypes.string,
  title: PropTypes.node,
};

LogoElement.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default LogoElement;
