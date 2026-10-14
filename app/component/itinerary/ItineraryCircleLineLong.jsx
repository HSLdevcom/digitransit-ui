import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from '../Icon';
import RouteNumber from '../RouteNumber';
import { legShape } from '../../../utils/client/shapes';
import { ViaLocationType } from '../../../utils/shared/constants';

const ItineraryCircleLineLong = ({
  index,
  color,
  renderBottomMarker = false,
  modeClassName,
  boardingLeg,
  viaType = null,
  isStop = false,
}) => {
  const isFirstChild = () => {
    return index === 0;
  };

  const getMarker = top => {
    if (isFirstChild() && top) {
      return (
        <div className="itinerary-icon-container start">
          <Icon
            img="icon_origin-ellipse"
            className="itinerary-icon from from-it"
          />
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
    return null;
  };

  let firstModeClassName;
  let secondModeClassName;
  let positionRelativeToTransit;
  if (boardingLeg.to.stop !== null && boardingLeg.from.stop !== null) {
    positionRelativeToTransit = 'between-transit';
    firstModeClassName = boardingLeg.mode.toLowerCase();
    secondModeClassName = modeClassName.toLowerCase();
  } else if (boardingLeg.to.stop !== null) {
    positionRelativeToTransit = 'before-transit';
    firstModeClassName = modeClassName.toLowerCase();
    secondModeClassName = boardingLeg.mode.toLowerCase();
  } else {
    // boardingLeg.from.stop !== undefined
    positionRelativeToTransit = 'after-transit';
    firstModeClassName = boardingLeg.mode.toLowerCase();
    secondModeClassName = modeClassName.toLowerCase();
  }

  const topMarker = getMarker(true);
  const bottomMarker = getMarker(false);
  const legBeforeLineStyle = { color };
  const carBoardingRouteNumber = (
    <RouteNumber mode="car" icon="icon_car" vertical />
  );
  return (
    <div
      className={cx('leg-before long', modeClassName, {
        first: index === 0,
      })}
      aria-hidden="true"
    >
      {topMarker}
      <div
        style={legBeforeLineStyle}
        className={cx(
          'leg-before-line top',
          positionRelativeToTransit,
          firstModeClassName,
          'default-dotted-line',
        )}
      />
      <div
        className={cx(
          'itinerary-route-number',
          'first',
          positionRelativeToTransit,
        )}
      >
        {modeClassName === 'bicycle' ? (
          <RouteNumber mode={firstModeClassName} vertical />
        ) : (
          positionRelativeToTransit === 'before-transit' &&
          carBoardingRouteNumber
        )}
      </div>
      <div
        style={legBeforeLineStyle}
        className={cx(
          'leg-before-line middle',
          positionRelativeToTransit,
          modeClassName,
          'default-dotted-line',
        )}
      />
      <div
        className={cx(
          'itinerary-route-number',
          'second',
          positionRelativeToTransit,
        )}
      >
        {modeClassName === 'bicycle' ? (
          <RouteNumber mode={secondModeClassName} vertical />
        ) : (
          (positionRelativeToTransit === 'after-transit' ||
            positionRelativeToTransit === 'between-transit') &&
          carBoardingRouteNumber
        )}
      </div>
      {positionRelativeToTransit === 'between-transit' && (
        <div
          style={legBeforeLineStyle}
          className={cx(
            'leg-before-line second-middle',
            positionRelativeToTransit,
            modeClassName,
            'default-dotted-line',
          )}
        />
      )}
      {positionRelativeToTransit === 'between-transit' &&
        modeClassName === 'bicycle' && (
          <div
            className={cx(
              'itinerary-route-number',
              'third',
              positionRelativeToTransit,
            )}
          >
            <RouteNumber mode={firstModeClassName} vertical />
          </div>
        )}

      <div
        style={legBeforeLineStyle}
        className={cx(
          'leg-before-line bottom',
          positionRelativeToTransit,
          positionRelativeToTransit === 'between-transit'
            ? firstModeClassName
            : secondModeClassName,
          'default-dotted-line',
        )}
      />
      {renderBottomMarker && bottomMarker}
    </div>
  );
};

ItineraryCircleLineLong.propTypes = {
  index: PropTypes.number.isRequired,
  color: PropTypes.string,
  renderBottomMarker: PropTypes.bool,
  modeClassName: PropTypes.string.isRequired,
  boardingLeg: legShape.isRequired,
  viaType: PropTypes.string,
  isStop: PropTypes.bool,
};

export default ItineraryCircleLineLong;
