import PropTypes from 'prop-types';
import React, { useState } from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import TruncatedMessage from './TruncatedMessage';
import {
  getServiceAlertDescription,
  getServiceAlertHeader,
} from '../util/alertUtils';

const DisruptionBannerAlert = (
  { language, alert, openAllAlerts, truncate, onClose },
  { intl, config },
) => {
  const [renderLink, setRenderLink] = useState(false);

  let header = getServiceAlertHeader(alert, language);
  let message = getServiceAlertDescription(alert, language);
  const useHeader =
    config.showAlertHeader &&
    header &&
    header.length <= 120 &&
    !message.includes(header);
  if (useHeader) {
    header = <h3 className="disruption-info-header">{header}</h3>;
    message = (
      <>
        {header}
        {message}
      </>
    );
  }
  return (
    <div>
      <div className="disruption-container">
        <div className="disruption-icon-container">
          <Icon img="icon-icon_disruption-banner-alert" />
        </div>
        <div className="disruption-info-container">
          {(!config.URL.ROOTLINK || !config.trafficNowLink) && (
            <>
              <TruncatedMessage
                className="disruption-show-more"
                lines={3}
                message={message}
                truncate={truncate}
                onShowMore={openAllAlerts}
              />
            </>
          )}
          {config.URL.ROOTLINK &&
            config.trafficNowLink &&
            (truncate && !renderLink ? (
              <>
                <TruncatedMessage
                  className="disruption-show-more"
                  lines={3}
                  message={message}
                  truncate={truncate}
                  onShowMore={openAllAlerts}
                  onTruncate={i => setRenderLink(i)}
                />
              </>
            ) : (
              <a
                className="disruption-info-content"
                onClick={e => e.stopPropagation()}
                href={`${config.URL.ROOTLINK}/${
                  language === 'fi' ? '' : `${language}/`
                }${config.trafficNowLink[language]}`}
              >
                {message}
              </a>
            ))}
        </div>
        <button
          title={intl.formatMessage({
            id: 'messagebar-label-close-message-bar',
            defaultMessage: 'Close banner',
          })}
          onClick={() => onClose()}
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
    </div>
  );
};

DisruptionBannerAlert.propTypes = {
  alert: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  truncate: PropTypes.bool,
  openAllAlerts: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

DisruptionBannerAlert.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default DisruptionBannerAlert;
