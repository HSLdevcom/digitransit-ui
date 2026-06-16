import React from 'react';
import PropTypes from 'prop-types';
import { stopShape } from '../util/shapes';
import StopScheduleStatus from './stop/StopScheduleStatus';

const SelectedStopPopupContent = ({
  stop,
  name = undefined,
  status = undefined,
  alertEffect = undefined,
}) => (
  <div className="origin-popup">
    <div className="origin-popup-header">
      <div className="selected-stop-header">{name || stop.name}</div>
    </div>
    {(stop.code || stop.desc) && (
      <div>
        <div className="origin-popup-name">
          <div className="selected-stop-popup">
            {stop.code && <p className="card-code">{stop.code}</p>}
            <span className="description">{stop.desc}</span>
          </div>
        </div>
        <div className="shade-to-white" />
      </div>
    )}
    <StopScheduleStatus
      status={status}
      alertEffect={alertEffect}
      className="selected-stop-status"
    />
  </div>
);

SelectedStopPopupContent.propTypes = {
  stop: stopShape.isRequired,
  name: PropTypes.node,
  status: PropTypes.string,
  alertEffect: PropTypes.string,
};

SelectedStopPopupContent.displayName = 'SelectedStopPopupContent';

export default SelectedStopPopupContent;
