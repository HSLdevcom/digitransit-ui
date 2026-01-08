import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from '../Icon';
import { ViaLocationType } from '../../constants';

class ItineraryCircleLine extends React.Component {
  static defaultProps = {
    viaType: null,
    color: null,
    renderBottomMarker: true,
    carPark: false,
    appendClass: undefined,
    isStop: false,
  };

  static propTypes = {
    index: PropTypes.number.isRequired,
    modeClassName: PropTypes.string.isRequired,
    viaType: PropTypes.string,
    color: PropTypes.string,
    renderBottomMarker: PropTypes.bool,
    carPark: PropTypes.bool,
    appendClass: PropTypes.string,
    isStop: PropTypes.bool,
  };

  isFirstChild = () => {
    return this.props.index === 0 && !this.props.viaType;
  };

  getMarker = top => {
    const circleMarker = (
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
    const showCircle = this.props.appendClass !== 'taxi';
    if (this.isFirstChild() && top) {
      return (
        <>
          <div className="itinerary-icon-container start">
            <Icon
              img="icon_mapMarker"
              className="itinerary-icon from from-it"
            />
          </div>
          {showCircle && circleMarker}
        </>
      );
    }
    if (this.props.carPark) {
      return (
        <div className="itinerary-icon-container car-park">
          <Icon img="icon_car-park" />
        </div>
      );
    }
    if (this.props.viaType === ViaLocationType.Visit && !this.props.isStop) {
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
    const legBeforeLineStyle = { color: this.props.color };
    let backgroundClass = '';
    if (
      this.props.modeClassName === 'car-park-walk' ||
      this.props.modeClassName === 'walk'
    ) {
      backgroundClass = 'default-dotted-line';
    }

    return (
      <div
        className={cx('leg-before', this.props.modeClassName, {
          first: this.props.index === 0,
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
            backgroundClass,
          )}
        />
        {this.props.renderBottomMarker && bottomMarker}
      </div>
    );
  }
}

export default ItineraryCircleLine;
