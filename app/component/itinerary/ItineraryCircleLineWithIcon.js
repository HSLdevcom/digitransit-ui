import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from '../Icon';
import RouteNumber from '../RouteNumber';
import { IndoorRouteLegType, ViaLocationType } from '../../constants';

class ItineraryCircleLineWithIcon extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    modeClassName: PropTypes.string.isRequired,
    indoorRouteLegType: PropTypes.oneOf(Object.values(IndoorRouteLegType)),
    showIntermediateSteps: PropTypes.bool,
    viaType: PropTypes.string,
    bikePark: PropTypes.bool,
    carPark: PropTypes.bool,
    color: PropTypes.string,
    appendClass: PropTypes.string,
    icon: PropTypes.string,
    style: PropTypes.shape({}),
    isNotFirstLeg: PropTypes.bool,
    onlyOneStep: PropTypes.bool,
    isStop: PropTypes.bool,
  };

  static defaultProps = {
    indoorRouteLegType: IndoorRouteLegType.NoStepsInside,
    showIntermediateSteps: false,
    viaType: null,
    color: null,
    bikePark: false,
    carPark: false,
    appendClass: undefined,
    icon: undefined,
    style: {},
    isNotFirstLeg: undefined,
    onlyOneStep: false,
    isStop: false,
  };

  state = {
    defaultImageUrl: 'none',
    insideImageUrl: 'none',
  };

  isFirstChild = () => {
    return (
      !this.props.isNotFirstLeg && this.props.index === 0 && !this.props.viaType
    );
  };

  componentDidMount() {
    Promise.all([
      import(
        /* webpackChunkName: "dotted-line" */ `../../configurations/images/default/dotted-line.svg`
      ),
      import(
        /* webpackChunkName: "indoor-dotted-line" */ `../../configurations/images/default/indoor-dotted-line.svg`
      ),
    ]).then(([defaultImageUrl, insideImageUrl]) => {
      this.setState({
        defaultImageUrl: `url(${defaultImageUrl.default})`,
        insideImageUrl: `url(${insideImageUrl.default})`,
      });
    });
  }

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
          <Icon img="icon_mapMarker" className="itinerary-icon from from-it" />
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
    const legBeforeLineBottomStyle = {
      color: this.props.color,
      ...this.props.style,
    };
    if (
      this.props.modeClassName === 'walk' ||
      this.props.modeClassName === 'bicycle_walk'
    ) {
      legBeforeLineStyle.backgroundImage = this.state.defaultImageUrl;
      switch (this.props.indoorRouteLegType) {
        case IndoorRouteLegType.StepsAfterEntranceInside:
          legBeforeLineStyle.backgroundImage = this.state.defaultImageUrl;
          legBeforeLineBottomStyle.backgroundImage = this.state.insideImageUrl;
          break;
        case IndoorRouteLegType.StepsBeforeEntranceInside:
          if (this.props.showIntermediateSteps) {
            legBeforeLineStyle.backgroundImage = this.state.insideImageUrl;
            legBeforeLineBottomStyle.backgroundImage =
              this.state.insideImageUrl;
          } else {
            legBeforeLineStyle.backgroundImage = this.state.insideImageUrl;
            legBeforeLineBottomStyle.backgroundImage =
              this.state.defaultImageUrl;
          }
          break;
        default:
          legBeforeLineStyle.backgroundImage = this.state.defaultImageUrl;
          legBeforeLineBottomStyle.backgroundImage = this.state.defaultImageUrl;
      }
    }
    return (
      <div
        className={cx('leg-before', this.props.modeClassName, {
          via: !!this.props.viaType,
          'indoor-route':
            this.props.indoorRouteLegType !== IndoorRouteLegType.NoStepsInside,
          'only-one-step': this.props.onlyOneStep,
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
          )}
        />
        <RouteNumber
          appendClass={this.props.appendClass}
          mode={this.props.modeClassName}
          icon={this.props.icon}
          vertical
        />
        <div
          style={legBeforeLineBottomStyle}
          className={cx(
            'leg-before-line',
            this.props.modeClassName,
            'bottom',
            this.props.appendClass,
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
