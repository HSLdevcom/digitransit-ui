import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import some from 'lodash/some';

import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';

function StopPageTabContainer({
  children,
  params,
  routes,
  breakpoint,
  location,
}) {
  if (some(routes, 'fullscreenMap') && breakpoint !== 'large') {
    return null;
  }

  let activeTab;
  if (location.pathname.indexOf('/aikataulu') > -1) {
    activeTab = 'timetable';
  } else {
    activeTab = 'right-now';
  }

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
            className={`stop-tab-singletab ${
              activeTab === 'right-now' ? 'active' : 'inactive'
            }`}
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
            to={`${urlBase}/aikataulu`}
            className={`stop-tab-singletab ${
              activeTab === 'timetable' ? 'active' : 'inactive'
            }`}
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
