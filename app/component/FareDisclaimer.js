import React from 'react';
import { FormattedMessage } from 'react-intl';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import Icon from './Icon';

const FareDisclaimer = (
  { textId, values, href = null, linkText = null },
  { config },
) => {
  return (
    <div className="disclaimer-container unknown-fare-disclaimer__top">
      <div className="icon-container">
        <Icon className="info" img="icon-icon_info" />
      </div>
      <div className="description-container">
        <FormattedMessage
          id={textId}
          values={{ agencyName: get(config, values) }}
        />

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
  values: PropTypes.string.isRequired,
  href: PropTypes.string,
  linkText: PropTypes.string,
};

FareDisclaimer.defaultProps = {
  href: null,
  linkText: null,
};

FareDisclaimer.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default FareDisclaimer;
