import PropTypes from 'prop-types';
import React from 'react';
import { matchShape } from 'found';
import { routeShape } from '../../../util/shapes';
import RouteControlPanel from '../RouteControlPanel';

/**
 * Shown for routes that operate 24/7 instead of a timetable list.
 */
const ScheduleConstantOperation = ({
  constantOperationInfo,
  match,
  route,
  breakpoint,
}) => {
  return (
    <div
      className={`route-schedule-container ${
        breakpoint !== 'large' ? 'mobile' : ''
      }`}
    >
      <div className="constant-operation-panel">
        <RouteControlPanel
          match={match}
          route={route}
          breakpoint={breakpoint}
          noInitialServiceDay
        />
      </div>
      <div className="stop-constant-operation-container bottom-padding">
        <div className="constant-operation-content">
          {constantOperationInfo.text}
          <a
            className="constant-operation-link"
            href={constantOperationInfo.link}
            target="_blank"
            rel="noreferrer"
          >
            {constantOperationInfo.link}
          </a>
        </div>
      </div>
    </div>
  );
};

ScheduleConstantOperation.propTypes = {
  constantOperationInfo: PropTypes.shape({
    text: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  }).isRequired,
  match: matchShape.isRequired,
  route: routeShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

export default ScheduleConstantOperation;
