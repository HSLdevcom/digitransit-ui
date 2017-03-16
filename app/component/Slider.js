import React from 'react';
import cx from 'classnames';

class Slider extends React.Component {
  static propTypes = {
    className: React.PropTypes.string,
    id: React.PropTypes.string,
    defaultValue: React.PropTypes.number,
    initialValue: React.PropTypes.number.isRequired,
    onSliderChange: React.PropTypes.func.isRequired,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    step: React.PropTypes.number,
    headerText: React.PropTypes.string,
    minText: React.PropTypes.string,
    maxText: React.PropTypes.string,
    walkSpeed: React.PropTypes.number,
    transferMargin: React.PropTypes.number,
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    headerText: '',
    minText: '',
    maxText: '',
  };

  // eslint-disable-next-line
  defaultValue = this.props.defaultValue != null ? this.props.defaultValue :
    Math.floor((this.props.min + this.props.max) / 2);

  state = { modified: this.props.initialValue !== this.defaultValue }

  componentDidMount = () => {
    this.refs.slider.addEventListener('touchmove', e => e.stopPropagation());
  }

  componentWillUnmount = () => {
    this.refs.slider.removeEventListener('touchmove', e => e.stopPropagation());
  }

  valueChanged = (e) => {
    if (parseInt(e.target.value, 10) !== this.defaultValue) {
      this.setState({ modified: true });
    } else {
      this.setState({ modified: false });
    }
  }

  render() {
    let showWrittenValue = '';
    if (this.props.walkSpeed) {
      showWrittenValue = <div className="sub-header-h5 right">{this.props.walkSpeed} m/min</div>;
    } else if (this.props.transferMargin) {
      showWrittenValue = <div className="sub-header-h5 right">{this.props.transferMargin} min</div>;
    }

    return (
      <div
        ref="slider"
        className={
          cx('slider-container', this.props.className, this.state.modified ? 'modified' : '') }
      >
        <div className="slider-container-headers">
          <div className="left">
            <h4>{this.props.headerText}</h4>
          </div>
          {showWrittenValue}
        </div>
        <input
          id={this.props.id}
          className={cx('slider') }
          type="range"
          defaultValue={this.props.initialValue}
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          onMouseUp={this.props.onSliderChange}
          onTouchEnd={this.props.onSliderChange}
          onInput={this.valueChanged}
        />
        <span className="sub-header-h5 left">{this.props.minText}</span>
        <span className="sub-header-h5 right">{this.props.maxText}</span>
      </div>);
  }
}

export default Slider;
