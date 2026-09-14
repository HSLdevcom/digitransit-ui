import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from '../Icon';
import { ViaLocationType } from '../../constants';

function CircleMarker({ top, modeClassName, color, appendClass }) {
  return (
    <div
      className={cx(
        'leg-before-circle',
        'circle',
        modeClassName,
        { top },
        appendClass,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={28}
        height={28}
        style={{ fill: '#fff', stroke: color }}
      >
        <circle strokeWidth="4" width={28} cx={11} cy={10} r={6} />
      </svg>
    </div>
  );
}

CircleMarker.propTypes = {
  top: PropTypes.bool.isRequired,
  modeClassName: PropTypes.string.isRequired,
  color: PropTypes.string,
  appendClass: PropTypes.string,
};

export default function ItineraryCircleLine({
  index,
  modeClassName,
  viaType = null,
  color = null,
  renderBottomMarker = true,
  carPark = false,
  appendClass,
  isStop = false,
}) {
  const isFirstChild = index === 0 && !viaType;
  const showCircle = appendClass !== 'taxi';

  const getMarker = top => {
    if (isFirstChild && top) {
      return (
        <>
          <div className="itinerary-icon-container start">
            <Icon
              img="icon_origin-ellipse"
              className="itinerary-icon from from-it"
            />
          </div>
          {showCircle && (
            <CircleMarker
              top={top}
              modeClassName={modeClassName}
              color={color}
              appendClass={appendClass}
            />
          )}
        </>
      );
    }

    if (carPark) {
      return (
        <div className="itinerary-icon-container car-park">
          <Icon img="icon_car-park" />
        </div>
      );
    }

    if (viaType === ViaLocationType.Visit && !isStop) {
      return (
        <div className="itinerary-icon-container">
          <Icon img="icon_mapMarker" className="itinerary-icon via via-it" />
        </div>
      );
    }

    if (!showCircle) {
      return null;
    }

    return (
      <CircleMarker
        top={top}
        modeClassName={modeClassName}
        color={color}
        appendClass={appendClass}
      />
    );
  };

  const topMarker = getMarker(true);
  const bottomMarker = getMarker(false);

  let backgroundClass = '';
  if (modeClassName === 'car-park-walk' || modeClassName === 'walk') {
    backgroundClass = 'default-dotted-line';
  }

  return (
    <div
      className={cx('leg-before', modeClassName, {
        first: index === 0,
      })}
      aria-hidden="true"
    >
      {topMarker}

      <div
        style={{ color }}
        className={cx(
          'leg-before-line',
          modeClassName,
          appendClass,
          backgroundClass,
        )}
      />

      {renderBottomMarker && bottomMarker}
    </div>
  );
}

ItineraryCircleLine.propTypes = {
  index: PropTypes.number.isRequired,
  modeClassName: PropTypes.string.isRequired,
  viaType: PropTypes.string,
  color: PropTypes.string,
  renderBottomMarker: PropTypes.bool,
  carPark: PropTypes.bool,
  appendClass: PropTypes.string,
  isStop: PropTypes.bool,
};
