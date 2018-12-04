import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import some from 'lodash/some';

import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';

const Tab = {
  RightNow: 'right-now',
  Timetable: 'aikataulu',
  RoutesAndPlatforms: 'linjat',
  Disruptions: 'hairiot',
};

const getActiveTab = pathname => {
  if (pathname.indexOf(`/${Tab.Timetable}`) > -1) {
    return Tab.Timetable;
  }
  if (pathname.indexOf(`/${Tab.RoutesAndPlatforms}`) > -1) {
    return Tab.RoutesAndPlatforms;
  }
  if (pathname.indexOf(`/${Tab.Disruptions}`) > -1) {
    return Tab.Disruptions;
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 1024 1024"
                >
                  <path d="M368.356 1024.014c-44.781 0-81.079-36.302-81.079-81.079 0-361.528 294.123-655.658 655.651-655.658 44.781 0 81.079 36.302 81.079 81.079s-36.298 81.079-81.079 81.079c-272.112 0-493.497 221.385-493.497 493.5 0.004 44.773-36.295 81.079-81.075 81.079z" />
                  <path d="M81.072 1024.014c-44.781 0-81.079-36.302-81.079-81.079 0-519.948 423.002-942.946 942.939-942.946 44.781 0 81.079 36.302 81.079 81.079s-36.298 81.079-81.079 81.079c-430.524 0-780.781 350.257-780.781 780.788 0 44.773-36.298 81.079-81.079 81.079z" />
                </svg>
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
                <Icon img="icon-icon_schedule" className="stop-page-tab_icon" />
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
                <Icon
                  className="routes-platforms-page-tab_icon"
                  img="icon-icon_info"
                />
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

export default withBreakpoint(StopPageTabContainer);
