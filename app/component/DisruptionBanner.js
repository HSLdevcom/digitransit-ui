import PropTypes from 'prop-types';
import React, { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { alertShape } from '../util/shapes';
import { isAlertValid } from '../util/alertUtils';
import DisruptionBannerAlert from './DisruptionBannerAlert';
import SwipeableTabs from './SwipeableTabs';
import withBreakpoint from '../util/withBreakpoint';
import { AlertEntityType } from '../constants';
import { withCurrentTime } from '../hooks/TimeContext';

const DisruptionBanner = ({ alerts, currentTime, mode, breakpoint }) => {
  const [allAlertsOpen, setAllAlertsOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const openAllAlerts = () => {
    setAllAlertsOpen(true);
  };

  const onSwipe = i => {
    setTabIndex(i);
  };

  const getAlerts = () => {
    const activeAlerts = [];
    alerts.forEach(alert => {
      if (
        alert?.entities.some(
          e =>
            // eslint-disable-next-line no-underscore-dangle
            e.__typename === AlertEntityType.Route && e.mode === mode,
        ) &&
        !isEmpty(alert.alertDescriptionText) &&
        isAlertValid(alert, currentTime)
      ) {
        if (
          !activeAlerts.find(
            activeAlert =>
              activeAlert.alertDescriptionText === alert.alertDescriptionText,
          )
        ) {
          activeAlerts.push(alert);
        }
      }
    });
    return activeAlerts;
  };

  const renderAlert = alert => {
    return (
      <div key={alert.id}>
        <DisruptionBannerAlert
          alert={alert}
          truncate={!allAlertsOpen}
          openAllAlerts={openAllAlerts}
          onClose={() => setIsOpen(false)}
        />
      </div>
    );
  };

  const activeAlerts = getAlerts();

  if (!activeAlerts.length || !isOpen) {
    return null;
  }
  const tabs = activeAlerts.map(alert => renderAlert(alert));

  return (
    <div className="disruption-banner-container">
      {tabs.length > 1 ? (
        <SwipeableTabs
          tabs={tabs}
          tabIndex={tabIndex}
          onSwipe={onSwipe}
          classname="disruption-banner"
          hideArrows={breakpoint !== 'large'}
          navigationOnBottom
          ariaRole="swipe-disruption-info-tab"
        />
      ) : (
        renderAlert(activeAlerts[0])
      )}
    </div>
  );
};

DisruptionBanner.propTypes = {
  alerts: PropTypes.arrayOf(alertShape).isRequired,
  currentTime: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

const DisruptionBannerWithBreakpoint = withBreakpoint(DisruptionBanner);

const containerComponent = withCurrentTime(DisruptionBannerWithBreakpoint);

export { containerComponent as default, DisruptionBanner as Component };
