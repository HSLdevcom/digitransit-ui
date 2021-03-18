import PropTypes from 'prop-types';
import React, { useState } from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import TruncatedMessage from './TruncatedMessage';

const DisruptionBannerAlert = ({ message, language }, { intl, config }) => {
  const [isOpen, setOpen] = useState(true);
  return (
    isOpen && (
      <div className="disruption-banner-container">
        <div className="disruption-icon-container">
          <Icon img="icon-icon_disruption-banner-alert" />
        </div>
        <div className="disruption-info-container">
          {config.CONFIG !== 'hsl' && (
            <TruncatedMessage
              className="disruption-show-more"
              lines={3}
              message={message}
            />
          )}
          {config.CONFIG === 'hsl' && (
            <a
              className="disruption-info-content"
              onClick={e => e.stopPropagation()}
              href={`${config.URL.ROOTLINK}/${
                language === 'fi' ? '' : `${language}/`
              }${config.trafficNowLink[language]}`}
            >
              {message}
            </a>
          )}
        </div>
        <button
          title={intl.formatMessage({
            id: 'messagebar-label-close-message-bar',
            defaultMessage: 'Close banner',
          })}
          onClick={() => setOpen(false)}
          className={cx(
            'noborder',
            'disruption-close-button',
            'cursor-pointer',
          )}
          type="button"
        >
          <Icon img="icon-icon_close" className="close" color="#fff" />
        </button>
      </div>
    )
  );
};

DisruptionBannerAlert.propTypes = {
  message: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
};

DisruptionBannerAlert.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default DisruptionBannerAlert;
