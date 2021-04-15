import PropTypes from 'prop-types';
import React, { useState } from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import SwipeableTabs from './SwipeableTabs';
import TruncatedMessage from './TruncatedMessage';
import {
  getServiceAlertDescription,
  getServiceAlertHeader,
} from '../util/alertUtils';
import withBreakpoint from '../util/withBreakpoint';

const DisruptionBannerAlert = (
  { language, alerts, breakpoint },
  { intl, config },
) => {
  const [isOpen, setOpen] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const onSwipe = i => {
    setTabIndex(i);
  };
  const createAlertText = alert => getServiceAlertDescription(alert, language);

  const createAlertHeader = alert => getServiceAlertHeader(alert, language);

  const renderAlert = alert => {
    const header = createAlertHeader(alert);
    const message = createAlertText(alert);
    const useHeader =
      header && header.length <= 120 && !message.includes(header);
    return (
      <div key={alert.id} className="disruption-container">
        <div className="disruption-icon-container">
          <Icon img="icon-icon_disruption-banner-alert" />
        </div>
        <div className="disruption-info-container">
          {(!config.URL.ROOTLINK || !config.trafficNowLink) && (
            <>
              {useHeader && (
                <h3 className="disruption-info-header">{header}</h3>
              )}
              <TruncatedMessage
                className="disruption-show-more"
                lines={useHeader ? 2 : 3}
                message={message}
              />
            </>
          )}
          {config.URL.ROOTLINK && config.trafficNowLink && (
            <a
              className="disruption-info-content"
              onClick={e => e.stopPropagation()}
              href={`${config.URL.ROOTLINK}/${
                language === 'fi' ? '' : `${language}/`
              }${config.trafficNowLink[language]}`}
            >
              {useHeader && (
                <h3 className="disruption-info-header">{header}</h3>
              )}
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
    );
  };

  const tabs = alerts.map(alert => renderAlert(alert));

  return (
    isOpen && (
      <div className="disruption-banner-container">
        {tabs.length > 1 ? (
          <SwipeableTabs
            tabs={tabs}
            tabIndex={tabIndex}
            onSwipe={onSwipe}
            classname="disruption-banner"
            hideArrows={breakpoint !== 'large'}
            navigationOnBottom
          />
        ) : (
          renderAlert(alerts[0])
        )}
      </div>
    )
  );
};

DisruptionBannerAlert.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  alerts: PropTypes.array.isRequired,
  language: PropTypes.string.isRequired,
};

DisruptionBannerAlert.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

const DisruptionBannerAlertWithBreakpoint = withBreakpoint(
  DisruptionBannerAlert,
);

export default DisruptionBannerAlertWithBreakpoint;
