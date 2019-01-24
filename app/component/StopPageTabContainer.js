import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import some from 'lodash/some';

import Icon from './Icon';
import {
  stoptimeHasCancelation,
  patternHasServiceAlert,
} from '../util/alertUtils';
import withBreakpoint from '../util/withBreakpoint';

const Tab = {
  Disruptions: 'hairiot',
  RightNow: 'right-now',
  RoutesAndPlatforms: 'linjat',
  Timetable: 'aikataulu',
};

const getActiveTab = pathname => {
  if (pathname.indexOf(`/${Tab.Disruptions}`) > -1) {
    return Tab.Disruptions;
  }
  if (pathname.indexOf(`/${Tab.RoutesAndPlatforms}`) > -1) {
    return Tab.RoutesAndPlatforms;
  }
  if (pathname.indexOf(`/${Tab.Timetable}`) > -1) {
    return Tab.Timetable;
  }
  return Tab.RightNow;
};

function StopPageTabContainer({
  children,
  params,
  routes,
  breakpoint,
  location: { pathname },
  stop,
}) {
  if (some(routes, 'fullscreenMap') && breakpoint !== 'large') {
    return null;
  }

  const activeTab = getActiveTab(pathname);
  const isTerminal = params.terminalId != null;
  const urlBase = `/${
    isTerminal ? 'terminaalit' : 'pysakit'
  }/${encodeURIComponent(
    params.terminalId ? params.terminalId : params.stopId,
  )}`;
  const hasActiveAlert =
    Array.isArray(stop.stoptimesForServiceDate) &&
    stop.stoptimesForServiceDate.some(
      st =>
        patternHasServiceAlert(st.pattern) ||
        (Array.isArray(st.stoptimes) &&
          st.stoptimes.some(stoptimeHasCancelation)),
    );

  return (
    <div className="stop-page-content-wrapper">
      <div>
        <div className="stop-tab-container">
          <Link
            to={urlBase}
            className={cx('stop-tab-singletab', {
              active: activeTab === Tab.RightNow,
            })}
          >
            <div className="stop-tab-singletab-container">
              <div>
                <Icon
                  className="stop-page-tab_icon"
                  img="icon-icon_right-now"
                />
              </div>
              <div>
                <FormattedMessage id="right-now" defaultMessage="right now" />
              </div>
            </div>
          </Link>
          <Link
            to={`${urlBase}/${Tab.Timetable}`}
            className={cx('stop-tab-singletab', {
              active: activeTab === Tab.Timetable,
            })}
          >
            <div className="stop-tab-singletab-container">
              <div>
                <Icon className="stop-page-tab_icon" img="icon-icon_schedule" />
              </div>
              <div>
                <FormattedMessage id="timetable" defaultMessage="timetable" />
              </div>
            </div>
          </Link>
          <Link
            to={`${urlBase}/${Tab.RoutesAndPlatforms}`}
            className={cx('stop-tab-singletab', {
              active: activeTab === Tab.RoutesAndPlatforms,
            })}
          >
            <div className="stop-tab-singletab-container">
              <div>
                <Icon className="stop-page-tab_icon" img="icon-icon_info" />
              </div>
              <div>
                <FormattedMessage
                  id="routes-platforms"
                  defaultMessage="routes-platforms"
                />
              </div>
            </div>
          </Link>
          <Link
            to={`${urlBase}/${Tab.Disruptions}`}
            className={cx('stop-tab-singletab', {
              active: activeTab === Tab.Disruptions,
              'alert-active': hasActiveAlert,
            })}
          >
            <div className="stop-tab-singletab-container">
              <div>
                <Icon className="stop-page-tab_icon" img="icon-icon_caution" />
              </div>
              <div>
                <FormattedMessage id="disruptions" />
              </div>
            </div>
          </Link>
        </div>
        <div className="stop-tabs-fillerline" />
      </div>
      {children}
    </div>
  );
}

StopPageTabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  breakpoint: PropTypes.string.isRequired,
  params: PropTypes.oneOfType([
    PropTypes.shape({ stopId: PropTypes.string.isRequired }).isRequired,
    PropTypes.shape({ terminalId: PropTypes.string.isRequired }).isRequired,
  ]).isRequired,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      fullscreenMap: PropTypes.bool,
    }).isRequired,
  ).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  stop: PropTypes.shape({
    stoptimesForServiceDate: PropTypes.arrayOf(
      PropTypes.shape({
        pattern: PropTypes.shape({
          route: PropTypes.shape({
            alerts: PropTypes.array.isRequired,
          }).isRequired,
        }).isRequired,
        stoptimes: PropTypes.arrayOf(
          PropTypes.shape({
            realtimeState: PropTypes.string.isRequired,
          }),
        ).isRequired,
      }),
    ),
  }).isRequired,
};

const containerComponent = Relay.createContainer(
  withBreakpoint(StopPageTabContainer),
  {
    fragments: {
      stop: () => Relay.QL`
        fragment on Stop {
          stoptimesForServiceDate(date:$date, omitCanceled:false) {
            pattern {
              route {
                alerts
              }
            }
            stoptimes {
              realtimeState
            }
          }
        }
      `,
    },
    initialVariables: {
      date: moment().format('YYYYMMDD'),
    },
  },
);

export { containerComponent as default, StopPageTabContainer as Component };
