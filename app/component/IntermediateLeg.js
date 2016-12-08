import React from 'react';
import StopCode from './StopCode';

function IntermediateLeg({ mode, name, stopCode, focusFunction }) {
  const modeClassName =
    `${mode.toLowerCase()}`;

  return (
    <div style={{ width: '100%' }} className="row itinerary-row" onClick={e => focusFunction(e)}>
      <div className="small-2 columns itinerary-time-column" />
      <div
        className={`small-10 columns itinerary-instruction-column intermediate ${modeClassName}`}
      >
        <div className="itinerary-leg-first-row">
          <div className="itinerary-intermediate-stop-name">
            {name} <StopCode code={stopCode} />
          </div>

        </div>
        <div className="itinerary-leg-action" />
      </div>
    </div>
  );
}

IntermediateLeg.propTypes = {
  focusFunction: React.PropTypes.func.isRequired,
  waitTime: React.PropTypes.number.isRequired,
  name: React.PropTypes.string.isRequired,
  mode: React.PropTypes.string.isRequired,
  stopCode: React.PropTypes.string.isRequired,
};

export default IntermediateLeg;
