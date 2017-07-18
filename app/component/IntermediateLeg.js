import PropTypes from 'prop-types';
import React from 'react';
import StopCode from './StopCode';

function IntermediateLeg({ mode, name, stopCode, focusFunction }) {
  const modeClassName = `${mode.toLowerCase()}`;

  return (
    <div
      style={{ width: '100%' }}
      className="row itinerary-row"
      onClick={e => focusFunction(e)}
    >
      <div className={`leg-before ${modeClassName}`}>
        <div className={`leg-before-circle circle-fill ${modeClassName}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28}>
            <circle strokeWidth="2" width={28} cx={11} cy={10} r={4} />
          </svg>
        </div>
        <div className={`leg-before-line ${modeClassName}`} />
      </div>
      <div
        className={`small-9 columns itinerary-instruction-column intermediate ${modeClassName}`}
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
  focusFunction: PropTypes.func.isRequired,
  waitTime: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  stopCode: PropTypes.string.isRequired,
};

export default IntermediateLeg;
