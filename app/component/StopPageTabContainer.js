import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import some from 'lodash/some';

import Icon from './Icon';
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
          {!isTerminal && (
            <Link
              to={`${urlBase}/${Tab.Disruptions}`}
              className={cx('stop-tab-singletab', {
                active: activeTab === Tab.Disruptions,
              })}
            >
              <div className="stop-tab-singletab-container">
                <div>
                  <Icon
                    className="stop-page-tab_icon"
                    img="icon-icon_caution"
                  />
                </div>
                <div>
                  <FormattedMessage id="disruptions" />
                </div>
              </div>
            </Link>
          )}
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
};

const defaultComponent = withBreakpoint(StopPageTabContainer);

export { defaultComponent as default, StopPageTabContainer as Component };
