import React from 'react';
import StopCode from './StopCode';

import Icon from './Icon';

function IntermediateLeg({ mode, name, stopCode, focusAction }) {
  const modeClassName =
    `${mode.toLowerCase()}`;

  return (
    <div style={{ width: '100%' }} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
&nbsp;
      </div>
      <div
        onClick={focusAction}
        className={`small-10 columns itinerary-instruction-column intermediate ${modeClassName}`}
      >
        <div className="itinerary-leg-first-row">
          <div className="itinerary-intermediate-stop-name">
            {name} <StopCode code={stopCode} />
          </div>
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action" />
      </div>
    </div>
  );
}

IntermediateLeg.propTypes = {
  focusAction: React.PropTypes.func.isRequired,
  waitTime: React.PropTypes.number.isRequired,
  name: React.PropTypes.string.isRequired,
  mode: React.PropTypes.string.isRequired,
  stopCode: React.PropTypes.string.isRequired,
};

export default IntermediateLeg;
