import PropTypes from 'prop-types';
import React, { useState } from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import SwipeableTabs from './SwipeableTabs';
import TruncatedMessage from './TruncatedMessage';

const DisruptionBannerAlert = ({ messages, language }, { intl, config }) => {
  const [isOpen, setOpen] = useState(true);

  const tabs = messages.map(alert => {
    return (
      <>
        <div className="disruption-icon-container">
          <Icon img="icon-icon_disruption-banner-alert" />
        </div>
        <div className="disruption-info-container">
          {(!config.URL.ROOTLINK || !config.trafficNowLink) && (
            <TruncatedMessage
              className="disruption-show-more"
              lines={3}
              message={alert}
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
              {alert}
            </a>
          )}
        </div>
      </>
    );
  });

  return (
    isOpen && (
      <div className="disruption-banner-container">
        <SwipeableTabs tabs={tabs} />

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
  messages: PropTypes.array.isRequired,
  language: PropTypes.string.isRequired,
};

DisruptionBannerAlert.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default DisruptionBannerAlert;
