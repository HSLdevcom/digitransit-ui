import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import StopCode from './StopCode';
import Icon from './Icon';

function IntermediateLeg({
  color,
  mode,
  arrivalTime,
  realTime,
  name,
  stopCode,
  focusFunction,
  zoneId,
}) {
  const modeClassName = mode.toLowerCase();

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div
      style={{ width: '100%' }}
      className={cx('row itinerary-row', { 'zone-limit': !!zoneId })}
      onClick={e => focusFunction(e)}
    >
      {zoneId && (
        <div className="zone-icon-container">
          <Icon img={`icon-icon_zone-${zoneId.toLowerCase()}`} />
        </div>
      )}
      <div className={`leg-before ${modeClassName}`}>
        <div className={`leg-before-circle circle-fill ${modeClassName}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={28}
            height={28}
            style={{ fill: color, stroke: color }}
          >
            <circle strokeWidth="2" width={28} cx={11} cy={10} r={4} />
          </svg>
        </div>
        <div style={{ color }} className={`leg-before-line ${modeClassName}`} />
      </div>
      <div
        className={`small-9 columns itinerary-instruction-column intermediate ${modeClassName}`}
      >
        <div className="itinerary-leg-first-row">
          <div className="itinerary-intermediate-stop-name">
            <span className={realTime ? 'realtime' : ''}>
              {realTime && (
                <Icon
                  img="icon-icon_realtime"
                  className="realtime-icon realtime"
                />
              )}
              {`${moment(arrivalTime).format('HH:mm')} `}
            </span>
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
  arrivalTime: PropTypes.number.isRequired,
  realTime: PropTypes.bool,
  name: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  color: PropTypes.string,
  stopCode: PropTypes.string.isRequired,
  zoneId: PropTypes.string,
};

IntermediateLeg.defaultProps = {
  zoneId: undefined,
};

export default IntermediateLeg;
