import cx from 'classnames';
import React, { useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { matchShape } from 'found';
import { stopShape } from '../../../utils/client/shapes';
import { AlertSeverityLevelType } from '../../../utils/shared/constants';
import {
  getCancelationsForStop,
  getAlertsForObject,
  getServiceAlertsForStation,
  getActiveAlertSeverityLevel,
} from '../../../utils/client/alertUtils';
import withBreakpoint from '../../../utils/client/withBreakpoint';
import { addAnalyticsEvent } from '../../../utils/shared/analyticsUtils';
import { unixTime } from '../../../utils/client/timeUtils';
import {
  PREFIX_DISRUPTION,
  PREFIX_TIMETABLE,
  stopPagePath,
} from '../../../utils/shared/path';
import Icon from '../Icon';

const Tab = {
  RightNow: 1,
  Timetable: 2,
  Disruptions: 3,
};

const getActiveTab = pathname => {
  if (pathname.indexOf(PREFIX_DISRUPTION) > -1) {
    return Tab.Disruptions;
  }
  if (pathname.indexOf(PREFIX_TIMETABLE) > -1) {
    return Tab.Timetable;
  }
  return Tab.RightNow;
};

function StopPageTabs({ stop }, { match }) {
  const { router, params } = match;
  if (!stop || params.alertId) {
    return null;
  }
  const activeTab = getActiveTab(match.location.pathname);
  const { search } = match.location;

  const [focusedTab, changeFocusedTab] = useState(activeTab);
  const rightNowTabRef = useRef();
  const timetableTabRef = useRef();
  const disruptionTabRef = useRef();
  const tabRefs = [rightNowTabRef, timetableTabRef, disruptionTabRef];

  const isTerminal = match.params.terminalId != null;
  const currentTime = unixTime();
  const cancelations = getCancelationsForStop(stop);
  const maxAlertSeverity = getActiveAlertSeverityLevel(
    isTerminal ? getServiceAlertsForStation(stop) : getAlertsForObject(stop),
    currentTime,
  );

  const alertsCount = (
    isTerminal ? getServiceAlertsForStation(stop) : getAlertsForObject(stop)
  ).length;

  let disruptionClassName;
  let disruptionIcon;
  if (
    cancelations.length > 0 ||
    maxAlertSeverity === AlertSeverityLevelType.Severe ||
    maxAlertSeverity === AlertSeverityLevelType.Warning ||
    maxAlertSeverity === AlertSeverityLevelType.Unknown
  ) {
    disruptionClassName = 'active-disruption-alert';
    disruptionIcon = (
      <span className="alert-circle" style={{ backgroundColor: '#DC0451' }}>
        {alertsCount}
      </span>
    );
  } else if (maxAlertSeverity === AlertSeverityLevelType.Info) {
    disruptionClassName = 'active-service-alert';
    disruptionIcon = <Icon className="service-alert-icon" img="icon_info" />;
  } else {
    disruptionClassName = 'no-alerts';
  }

  return (
    <div>
      {/* eslint-disable jsx-a11y/interactive-supports-focus */}
      <div
        className="route-tabs"
        role="tablist"
        onKeyDown={e => {
          const tabs = [Tab.RightNow, Tab.Timetable, Tab.Disruptions];
          const tabCount = tabs.length;
          const activeIndex = tabs.indexOf(focusedTab);
          let index;
          switch (e.nativeEvent.code) {
            case 'ArrowLeft':
              index = (activeIndex - 1 + tabCount) % tabCount;
              tabRefs[index].current.focus();
              changeFocusedTab(tabs[index]);
              break;
            case 'ArrowRight':
              index = (activeIndex + 1) % tabCount;
              tabRefs[index].current.focus();
              changeFocusedTab(tabs[index]);
              break;
            default:
              break;
          }
        }}
      >
        {/* eslint-enable jsx-a11y/interactive-supports-focus */}
        <button
          type="button"
          className={cx({ 'is-active': activeTab === Tab.RightNow })}
          onClick={() => {
            router.replace(stopPagePath(isTerminal, stop.gtfsId, null, search));
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenRightNowTab',
              name: null,
            });
          }}
          role="tab"
          ref={rightNowTabRef}
          tabIndex={focusedTab === Tab.RightNow ? 0 : -1}
          aria-selected={activeTab === Tab.RightNow}
          style={{ '--totalCount': '3' }}
        >
          <div>
            <FormattedMessage id="right-now" defaultMessage="right now" />
          </div>
        </button>
        <button
          type="button"
          className={cx({ 'is-active': activeTab === Tab.Timetable })}
          onClick={() => {
            router.replace(
              stopPagePath(isTerminal, stop.gtfsId, PREFIX_TIMETABLE, search),
            );
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenTimetableTab',
              name: null,
            });
          }}
          role="tab"
          ref={timetableTabRef}
          tabIndex={focusedTab === Tab.Timetable ? 0 : -1}
          aria-selected={activeTab === Tab.Timetable}
          style={{ '--totalCount': '3' }}
        >
          <div>
            <FormattedMessage id="timetable" defaultMessage="timetable" />
          </div>
        </button>
        <button
          type="button"
          className={cx({
            'is-active': activeTab === Tab.Disruptions,
            'alert-active': disruptionClassName === 'active-disruption-alert',
            'service-alert-active':
              disruptionClassName === 'active-service-alert',
          })}
          onClick={() => {
            router.replace(
              stopPagePath(isTerminal, stop.gtfsId, PREFIX_DISRUPTION, search),
            );
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenDisruptionsTab',
              name: null,
            });
          }}
          role="tab"
          ref={disruptionTabRef}
          tabIndex={focusedTab === Tab.Disruptions ? 0 : -1}
          aria-selected={activeTab === Tab.Disruptions}
          style={{ '--totalCount': '3' }}
        >
          <div
            className={`tab-route-disruption ${
              disruptionClassName || 'no-alerts'
            }`}
          >
            {disruptionIcon}
            <FormattedMessage id="disruptions" />
          </div>
        </button>
      </div>
    </div>
  );
}

StopPageTabs.propTypes = { stop: stopShape };
StopPageTabs.defaultProps = { stop: undefined };
StopPageTabs.contextTypes = { match: matchShape.isRequired };

const componentWithBreakpoint = withBreakpoint(StopPageTabs);

export { componentWithBreakpoint as default, StopPageTabs as Component };
