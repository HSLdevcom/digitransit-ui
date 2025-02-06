import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from './Icon';
import RouteNumber from './RouteNumber';
import { isBrowser } from '../util/browser';

class ItineraryCircleLineWithIcon extends React.Component {
  static defaultProps = {
    isVia: false,
    color: null,
    hideIcons: false,
  };

  static propTypes = {
    index: PropTypes.number.isRequired,
    modeClassName: PropTypes.string.isRequired,
    isVia: PropTypes.bool,
    bikePark: PropTypes.bool,
    carPark: PropTypes.bool,
    color: PropTypes.string,
    appendClass: PropTypes.string,
    icon: PropTypes.string,
    hideIcons: PropTypes.bool,
  };

  state = {
    imageUrl: 'none',
  };

  isFirstChild = () => {
    return this.props.index === 0 && this.props.isVia === false;
  };

  componentDidMount() {
    import(
      /* webpackChunkName: "dotted-line" */ `../configurations/images/default/dotted-line.svg`
    ).then(imageUrl => {
      this.setState({ imageUrl: `url(${imageUrl.default})` });
    });
  }

  getMarker = top => {
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
    if (this.isFirstChild()) {
      return (
        <div className="itinerary-icon-container start">
          <Icon
            img="icon-icon_mapMarker-from"
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
          <Icon img="icon-icon_car-park" />
        </div>
      );
    }
    if (
      this.props.modeClassName === 'walk' ||
      this.props.modeClassName === 'bicycle'
    ) {
      return <></>;
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
    let legBeforeLineStyle = { color: this.props.color };
    if (
      isBrowser &&
      (this.props.modeClassName === 'walk' ||
        this.props.modeClassName === 'bicycle_walk')
    ) {
      // eslint-disable-next-line global-require
      legBeforeLineStyle.backgroundImage = this.state.imageUrl;
    }
    if (this.props.hideIcons) {
      // Full height line if icons are hidden
      legBeforeLineStyle = {
        ...legBeforeLineStyle,
        height: '100%',
        top: 0,
      };
    }
    return (
      <div
        className={cx('leg-before', this.props.modeClassName, {
          via: this.props.isVia,
          'first-leg': this.props.index === 0,
        })}
        aria-hidden="true"
      >
        {!this.props.hideIcons && topMarker}

        <div
          style={legBeforeLineStyle}
          className={cx(
            'leg-before-line',
            this.props.modeClassName,
            this.props.appendClass,
          )}
        />
        {!this.props.hideIcons && (
          <>
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
              )}
            />
          </>
        )}
      </div>
    );
  }
}

export default ItineraryCircleLineWithIcon;
