import React from 'react';
import StopCode from './StopCode';

function IntermediateLeg({ color, mode, name, stopCode, focusFunction }) {
  const modeClassName =
    `${mode.toLowerCase()}`;

  return (
    <div style={{ width: '100%' }} className="row itinerary-row" onClick={e => focusFunction(e)}>
      <div className={`leg-before ${modeClassName}`}>
        <div className={`leg-before-circle circle-fill ${modeClassName}`}>
          <svg style={{ fill: color, stroke: color }} xmlns="http://www.w3.org/2000/svg" width={28} height={28}><circle strokeWidth="2" width={28} cx={11} cy={10} r={4} /></svg>
        </div>
        <div style={{ color }} className={`leg-before-line ${modeClassName}`} />
      </div>
      <div className={`small-10 columns itinerary-instruction-column intermediate ${modeClassName}`}>

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
  color: React.PropTypes.string,
  stopCode: React.PropTypes.string.isRequired,
};

export default IntermediateLeg;
