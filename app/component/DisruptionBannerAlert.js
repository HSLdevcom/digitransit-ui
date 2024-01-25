import PropTypes from 'prop-types';
import React, { useState } from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import TruncatedMessage from './TruncatedMessage';
import { mapAlertSource } from '../util/alertUtils';
import { AlertShape } from '../util/shapes';

const DisruptionBannerAlert = (
  { language, alert, openAllAlerts, truncate, onClose },
  { intl, config },
) => {
  const [renderLink, setRenderLink] = useState(false);

  let header = alert.alertHeaderText;
  let message = alert.alertDescriptionText;
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
              <div className="disruption-source-label">
                {mapAlertSource(config, language, alert.feed)}
              </div>
              <div className="disruption-message-font-weight">
                <TruncatedMessage
                  className="disruption-show-more"
                  lines={3}
                  message={message}
                  truncate={truncate}
                  onShowMore={openAllAlerts}
                />
              </div>
            </>
          )}
          {config.URL.ROOTLINK &&
            config.trafficNowLink &&
            (truncate && !renderLink ? (
              <>
                <div className="disruption-source-label">
                  {mapAlertSource(config, language, alert.feed)}
                </div>
                <div className="disruption-message-font-weight">
                  <TruncatedMessage
                    className="disruption-show-more"
                    lines={3}
                    message={message}
                    truncate={truncate}
                    onShowMore={openAllAlerts}
                    onTruncate={i => setRenderLink(i)}
                  />
                </div>
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
  alert: AlertShape.isRequired,
  language: PropTypes.string.isRequired,
  truncate: PropTypes.bool,
  openAllAlerts: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

DisruptionBannerAlert.defaultProps = {
  truncate: false,
  openAllAlerts: () => {},
};

DisruptionBannerAlert.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default DisruptionBannerAlert;
