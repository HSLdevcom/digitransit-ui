import React from 'react';
import { FormattedMessage } from 'react-intl';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import Icon from './Icon';

const InfoBox = (
  { textId, values, href = null, configData = null },
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
            <FormattedMessage id={configData} defaultMessage={configData} />
          </a>
        )}
      </div>
    </div>
  );
};

InfoBox.propTypes = {
  textId: PropTypes.string.isRequired,
  values: PropTypes.string.isRequired,
  href: PropTypes.string,
  configData: PropTypes.string,
};

InfoBox.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default InfoBox;
