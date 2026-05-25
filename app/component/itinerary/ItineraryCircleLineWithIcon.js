import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from '../Icon';
import RouteNumber from '../RouteNumber';
import { ViaLocationType, IndoorLegType } from '../../constants';

function ItineraryCircleLineWithIcon({
  index,
  modeClassName,
  viaType = null,
  indoorLegType = IndoorLegType.NoStepsInside,
  showIntermediateSteps = false,
  bikePark = false,
  carPark = false,
  color = null,
  appendClass,
  icon,
  style = {},
  isNotFirstLeg,
  isStop = false,
  hasPreviousTransitLeg = false,
  indoorStepsLength = 0,
}) {
  const getMarker = top => {
    if (top && hasPreviousTransitLeg) {
      return null;
    }
    if (viaType === ViaLocationType.Visit && !isStop) {
      return (
        <div className="itinerary-icon-container">
          <Icon img="icon_mapMarker" className="itinerary-icon via via-it" />
        </div>
      );
    }

    // Check if this is the first leg with no via point to show origin marker
    if (!isNotFirstLeg && index === 0 && !viaType) {
      return (
        <div className="itinerary-icon-container start">
          <Icon
            img="icon_origin-ellipse"
            className="itinerary-icon from from-it"
          />
        </div>
      );
    }
    if (bikePark) {
      return (
        <div className="itinerary-icon-container bike-park">
          <Icon img="icon-bike_parking" />
        </div>
      );
    }
    if (carPark) {
      return (
        <div className="itinerary-icon-container car-park">
          <Icon img="icon_car-park" />
        </div>
      );
    }
    if (modeClassName === 'walk' || modeClassName === 'bicycle') {
      return null;
    }
    return (
      <div
        className={`leg-before-circle circle ${modeClassName} ${
          top ? 'top' : ''
        }`}
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
  };

  const topMarker = getMarker(true);
  const bottomMarker = getMarker(false);
  const legBeforeLineStyle = { color, ...style };
  let topBackgroundClass = '';
  let bottomBackgroundClass = '';
  if (modeClassName === 'walk' || modeClassName === 'bicycle_walk') {
    switch (indoorLegType) {
      case IndoorLegType.StepsAfterEntranceInside:
        topBackgroundClass = 'default-dotted-line';
        bottomBackgroundClass = 'indoor-dotted-line';
        break;
      case IndoorLegType.StepsBeforeEntranceInside:
        if (showIntermediateSteps) {
          topBackgroundClass = 'indoor-dotted-line';
          bottomBackgroundClass = 'indoor-dotted-line';
        } else {
          topBackgroundClass = 'indoor-dotted-line';
          bottomBackgroundClass = 'default-dotted-line';
        }
        break;
      default:
        topBackgroundClass = 'default-dotted-line';
        bottomBackgroundClass = 'default-dotted-line';
    }
  }
  return (
    <div
      className={cx('leg-before', modeClassName, {
        via: !!viaType,
        indoor: indoorLegType !== IndoorLegType.NoStepsInside,
        'has-indoor-steps': indoorStepsLength !== 0,
        'only-one-step': indoorStepsLength === 1,
        'first-leg': index === 0 && !isNotFirstLeg,
      })}
      aria-hidden="true"
    >
      {topMarker}

      <div
        style={legBeforeLineStyle}
        className={cx(
          'leg-before-line',
          modeClassName,
          appendClass,
          topBackgroundClass,
        )}
      />
      <RouteNumber
        appendClass={appendClass}
        mode={modeClassName}
        icon={icon}
        vertical
      />
      <div
        style={legBeforeLineStyle}
        className={cx(
          'leg-before-line',
          modeClassName,
          'bottom',
          appendClass,
          bottomBackgroundClass,
        )}
      />
      {(modeClassName === 'scooter' || modeClassName === 'taxi-external') &&
        bottomMarker}
    </div>
  );
}

ItineraryCircleLineWithIcon.propTypes = {
  index: PropTypes.number.isRequired,
  modeClassName: PropTypes.string.isRequired,
  viaType: PropTypes.string,
  indoorLegType: PropTypes.oneOf(Object.values(IndoorLegType)),
  showIntermediateSteps: PropTypes.bool,
  bikePark: PropTypes.bool,
  carPark: PropTypes.bool,
  color: PropTypes.string,
  appendClass: PropTypes.string,
  icon: PropTypes.string,
  style: PropTypes.shape({}),
  isNotFirstLeg: PropTypes.bool,
  isStop: PropTypes.bool,
  hasPreviousTransitLeg: PropTypes.bool,
  indoorStepsLength: PropTypes.number,
};

export default ItineraryCircleLineWithIcon;
