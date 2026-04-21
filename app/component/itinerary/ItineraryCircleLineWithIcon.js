import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from '../Icon';
import RouteNumber from '../RouteNumber';
import { ViaLocationType, IndoorLegType } from '../../constants';

class ItineraryCircleLineWithIcon extends React.Component {
  static propTypes = {
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
    indoorStepsLength: PropTypes.number,
  };

  static defaultProps = {
    viaType: null,
    indoorLegType: IndoorLegType.NoStepsInside,
    showIntermediateSteps: false,
    color: null,
    bikePark: false,
    carPark: false,
    appendClass: undefined,
    icon: undefined,
    style: {},
    isNotFirstLeg: undefined,
    isStop: false,
    indoorStepsLength: 0,
  };

  isFirstChild = () => {
    return (
      !this.props.isNotFirstLeg && this.props.index === 0 && !this.props.viaType
    );
  };

  getMarker = top => {
    if (this.props.viaType === ViaLocationType.Visit && !this.props.isStop) {
      return (
        <div className="itinerary-icon-container">
          <Icon img="icon_mapMarker" className="itinerary-icon via via-it" />
        </div>
      );
    }
    if (this.isFirstChild()) {
      return (
        <div className="itinerary-icon-container start">
          <Icon
            img="icon_origin-ellipse"
            className="itinerary-icon from from-it"
          />
        </div>
      );
    }
    if (this.props.bikePark) {
      return (
        <div className="itinerary-icon-container bike-park">
          <Icon img="icon-bike_parking" />
        </div>
      );
    }
    if (this.props.carPark) {
      return (
        <div className="itinerary-icon-container car-park">
          <Icon img="icon_car-park" />
        </div>
      );
    }
    if (
      this.props.modeClassName === 'walk' ||
      this.props.modeClassName === 'bicycle'
    ) {
      return null;
    }
    return (
      <div
        className={`leg-before-circle circle ${this.props.modeClassName} ${
          top ? 'top' : ''
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={28}
          height={28}
          style={{ fill: '#fff', stroke: this.props.color }}
        >
          <circle strokeWidth="4" width={28} cx={11} cy={10} r={6} />
        </svg>
      </div>
    );
  };

  render() {
    const topMarker = this.getMarker(true);
    const bottomMarker = this.getMarker(false);
    const legBeforeLineStyle = { color: this.props.color, ...this.props.style };
    let topBackgroundClass = '';
    let bottomBackgroundClass = '';
    if (
      this.props.modeClassName === 'walk' ||
      this.props.modeClassName === 'bicycle_walk'
    ) {
      switch (this.props.indoorLegType) {
        case IndoorLegType.StepsAfterEntranceInside:
          topBackgroundClass = 'default-dotted-line';
          bottomBackgroundClass = 'indoor-dotted-line';
          break;
        case IndoorLegType.StepsBeforeEntranceInside:
          if (this.props.showIntermediateSteps) {
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
        className={cx('leg-before', this.props.modeClassName, {
          via: !!this.props.viaType,
          indoor: this.props.indoorLegType !== IndoorLegType.NoStepsInside,
          'has-indoor-steps': this.props.indoorStepsLength !== 0,
          'only-one-step': this.props.indoorStepsLength === 1,
          'first-leg': this.props.index === 0 && !this.props.isNotFirstLeg,
        })}
        aria-hidden="true"
      >
        {topMarker}

        <div
          style={legBeforeLineStyle}
          className={cx(
            'leg-before-line',
            this.props.modeClassName,
            this.props.appendClass,
            topBackgroundClass,
          )}
        />
        <RouteNumber
          appendClass={this.props.appendClass}
          mode={this.props.modeClassName}
          icon={this.props.icon}
          vertical
        />
        <div
          style={legBeforeLineStyle}
          className={cx(
            'leg-before-line',
            this.props.modeClassName,
            'bottom',
            this.props.appendClass,
            bottomBackgroundClass,
          )}
        />
        {(this.props.modeClassName === 'scooter' ||
          this.props.modeClassName === 'taxi-external') &&
          bottomMarker}
      </div>
    );
  }
}

export default ItineraryCircleLineWithIcon;
