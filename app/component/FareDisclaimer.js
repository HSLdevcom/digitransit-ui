import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Icon from './Icon';

const FareDisclaimer = ({ textId, values, href = null, linkText = null }) => {
  return (
    <div className="disclaimer-container unknown-fare-disclaimer__top">
      <div className="icon-container">
        <Icon className="info" img="icon-icon_info" />
      </div>
      <div className="description-container">
        <FormattedMessage id={textId} values={values} />

        {href && (
          <a href={href}>
            <FormattedMessage id={linkText} defaultMessage={linkText} />
          </a>
        )}
      </div>
    </div>
  );
};

FareDisclaimer.propTypes = {
  textId: PropTypes.string.isRequired,
  values: PropTypes.shape({
    agencyName: PropTypes.string,
  }),
  href: PropTypes.string,
  linkText: PropTypes.string,
};

FareDisclaimer.defaultProps = {
  values: null,
  href: null,
  linkText: null,
};

export default FareDisclaimer;
