import React from 'react';
import cx from 'classnames';

class Slider extends React.Component {
  static propTypes = {
    className: React.PropTypes.string,
    id: React.PropTypes.string,
    defaultValue: React.PropTypes.number.isRequired,
    onSliderChange: React.PropTypes.func.isRequired,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    step: React.PropTypes.number,
    headerText: React.PropTypes.string,
    minText: React.PropTypes.string,
    maxText: React.PropTypes.string,
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    headerText: '',
    minText: '',
    maxText: '',
  };

  componentDidMount() {
    this.refs.slider.addEventListener('touchmove', this.f);
  }

  componentWillUnmount() {
    this.refs.slider.removeEventListener('touchmove', this.f);
  }

  f(e) {
    e.stopPropagation();
  }

  makeOption = value => <option>{value}</option>;

  render() {
    return (
      <div ref="slider" className={cx('slider-container', this.props.className)}>
        <h4>{this.props.headerText}</h4>
        <input
          id={this.props.id}
          className={cx('slider')}
          type="range"
          defaultValue={this.props.defaultValue}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          onMouseUp={this.props.onSliderChange}
          onTouchEnd={this.props.onSliderChange}
        />
        <span className="sub-header-h5 left">{this.props.minText}</span>
        <span className="sub-header-h5 right">{this.props.maxText}</span>
      </div>);
  }
}

export default Slider;
