import PropTypes from 'prop-types';
import React, { useState } from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import TruncatedMessage from './TruncatedMessage';

const DisruptionBannerAlert = (
  { message, header, language },
  { intl, config },
) => {
  const [isOpen, setOpen] = useState(true);
  const useHeader = header && header.length <= 120 && !message.includes(header);
  return (
    isOpen && (
      <div className="disruption-banner-container">
        <div className="disruption-icon-container">
          <Icon img="icon-icon_disruption-banner-alert" />
        </div>
        <div className="disruption-info-container">
          {useHeader && <h3 className="disruption-info-header">{header}</h3>}
          {(!config.URL.ROOTLINK || !config.trafficNowLink) && (
            <TruncatedMessage
              className="disruption-show-more"
              lines={useHeader ? 2 : 3}
              message={message}
            />
          )}
          {config.URL.ROOTLINK && config.trafficNowLink && (
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
  header: PropTypes.string,
  language: PropTypes.string.isRequired,
};

DisruptionBannerAlert.defaultProps = {
  header: null,
};

DisruptionBannerAlert.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default DisruptionBannerAlert;
