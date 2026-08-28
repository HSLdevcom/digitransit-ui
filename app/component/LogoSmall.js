import PropTypes from 'prop-types';
import React from 'react';
import { useConfigContext } from '../configurations/ConfigContext';

const LogoSmall = ({ logo, title }) => {
  const config = useConfigContext();
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
      style={{ backgroundImage: logo ? `url(${logo})` : 'none' }}
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

export default LogoSmall;
