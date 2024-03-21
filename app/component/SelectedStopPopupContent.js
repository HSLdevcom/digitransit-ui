import React from 'react';
import { stopShape } from '../util/shapes';

const SelectedStopPopupContent = ({ stop }) => (
  <div className="origin-popup">
    <div className="origin-popup-header">
      <div className="selected-stop-header">{stop.name}</div>
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
  </div>
);

SelectedStopPopupContent.propTypes = { stop: stopShape.isRequired };
SelectedStopPopupContent.displayName = 'SelectedStopPopupContent';

export default SelectedStopPopupContent;
