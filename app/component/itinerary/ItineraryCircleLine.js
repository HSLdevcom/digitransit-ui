import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from '../Icon';
import { isBrowser } from '../../util/browser';

class ItineraryCircleLine extends React.Component {
  static defaultProps = {
    isVia: false,
    color: null,
    renderBottomMarker: true,
    carPark: false,
  };

  static propTypes = {
    index: PropTypes.number.isRequired,
    modeClassName: PropTypes.string.isRequired,
    isVia: PropTypes.bool,
    color: PropTypes.string,
    renderBottomMarker: PropTypes.bool,
    carPark: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      imageUrl: 'none',
    };
  }

  componentDidMount() {
    import(
      /* webpackChunkName: "dotted-line" */ `../../configurations/images/default/dotted-line.svg`
    ).then(imageUrl => {
      this.setState({ imageUrl: `url(${imageUrl.default})` });
    });
  }

  isFirstChild = () => {
    return this.props.index === 0 && this.props.isVia === false;
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
          style={{ fill: this.props.color, stroke: this.props.color }}
        >
          <circle strokeWidth="4" width={28} cx={11} cy={10} r={6} />
        </svg>
      </div>
    );
    if (this.isFirstChild() && top) {
      return (
        <>
          <div className="itinerary-icon-container start">
            <Icon
              img="icon-icon_mapMarker"
              className="itinerary-icon from from-it"
            />
          </div>
          {circleMarker}
        </>
      );
    }
    if (this.props.carPark) {
      return (
        <div className="itinerary-icon-container car-park">
          <Icon img="icon-icon_car-park" />
        </div>
      );
    }
    if (this.props.isVia === true) {
      return (
        <div className="itinerary-icon-container">
          <Icon
            img="icon-icon_mapMarker"
            className="itinerary-icon via via-it"
          />
        </div>
      );
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
          style={{ fill: this.props.color, stroke: this.props.color }}
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
    if (isBrowser && this.props.modeClassName === 'car-park-walk') {
      // eslint-disable-next-line global-require
      legBeforeLineStyle.backgroundImage = this.state.imageUrl;
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
          className={cx('leg-before-line', this.props.modeClassName)}
        />
        {this.props.renderBottomMarker && bottomMarker}
      </div>
    );
  }
}

export default ItineraryCircleLine;
