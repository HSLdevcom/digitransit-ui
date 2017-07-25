import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';

class ItineraryCircleLine extends React.Component {
  static defaultProps = {
    isVia: false,
  };

  static propTypes = {
    index: PropTypes.number.isRequired,
    modeClassName: PropTypes.string.isRequired,
    isVia: PropTypes.bool,
    color: PropTypes.string,
  };

  static defaultProps = {
    color: null,
  };

  getMarker = () => {
    if (this.props.index === 0 && this.props.isVia === false) {
      return (
        <div className="itinerary-icon-container">
          <Icon
            img="icon-icon_mapMarker-point"
            className="itinerary-icon from from-it"
          />
        </div>
      );
    } else if (this.props.isVia === true) {
      return (
        <div className="itinerary-icon-container">
          <Icon img="icon-icon_place" className="itinerary-icon via via-it" />
        </div>
      );
    }
    return (
      <div className={`leg-before-circle circle ${this.props.modeClassName}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={28}
          height={28}
          style={{ fill: this.props.color, stroke: this.props.color }}
        >
          <circle
            stroke="white"
            strokeWidth="2"
            width={28}
            cx={11}
            cy={10}
            r={6}
          />
          <circle strokeWidth="2" width={28} cx={11} cy={10} r={4} />
        </svg>
      </div>
    );
  };

  render() {
    const marker = this.getMarker();
    return (
      <div className={`leg-before ${this.props.modeClassName}`}>
        {marker}
        <div
          style={{ color: this.props.color }}
          className={`leg-before-line ${this.props.modeClassName}`}
        />
      </div>
    );
  }
}

export default ItineraryCircleLine;
