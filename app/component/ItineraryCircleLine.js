import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';
import { isBrowser } from '../util/browser';

class ItineraryCircleLine extends React.Component {
  static defaultProps = {
    isVia: false,
    color: null,
  };

  static propTypes = {
    index: PropTypes.number.isRequired,
    modeClassName: PropTypes.string.isRequired,
    isVia: PropTypes.bool,
    color: PropTypes.string,
  };

  state = {
    imageUrl: 'none',
  };

  componentDidMount() {
    import(/* webpackChunkName: "dotted-line" */ `../configurations/images/default/dotted-line-bg.png`).then(
      imageUrl => {
        this.setState({ imageUrl: `url(${imageUrl.default})` });
      },
    );
  }

  getMarker = () => {
    if (this.props.index === 0 && this.props.isVia === false) {
      return (
        <div className="itinerary-icon-container">
          <Icon
            img="icon-icon_mapMarker-from"
            className="itinerary-icon from from-it"
          />
        </div>
      );
    }
    if (this.props.isVia === true) {
      return (
        <div className="itinerary-icon-container">
          <Icon
            img="icon-icon_mapMarker-via"
            className="itinerary-icon via via-it"
          />
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
    const legBeforeLineStyle = { color: this.props.color };
    if (
      isBrowser &&
      (this.props.modeClassName === 'walk' ||
        this.props.modeClassName === 'bicycle' ||
        this.props.modeClassName === 'bicycle_walk')
    ) {
      // eslint-disable-next-line global-require
      legBeforeLineStyle.backgroundImage = this.state.imageUrl;
    }

    return (
      <div
        className={`leg-before ${this.props.modeClassName}`}
        aria-hidden="true"
      >
        {marker}
        <div
          style={legBeforeLineStyle}
          className={`leg-before-line ${this.props.modeClassName}`}
        />
      </div>
    );
  }
}

export default ItineraryCircleLine;
