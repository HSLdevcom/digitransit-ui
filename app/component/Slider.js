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
    writtenValue: React.PropTypes.string,
    value: React.PropTypes.number,
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

  state = {
    modified: this.props.initialValue !== this.defaultValue,
  }

  componentWillMount = () =>
    (this.props.value === this.defaultValue ? this.setState({ modified: false })
    : this.setState({ modified: true }));

  componentDidMount = () =>
    this.slider && this.slider.addEventListener('touchmove', e => e.stopPropagation())
    && (this.props.value === this.defaultValue ? this.setState({ modified: false })
    : this.setState({ modified: true }));

  componentWillReceiveProps = () => {
    if (parseInt(this.props.value, 10) !== this.defaultValue) {
      this.setState({ modified: true });
    } else {
      this.setState({ modified: false });
    }
  }

  componentWillUnmount = () =>
    this.slider && this.slider.removeEventListener('touchmove', e => e.stopPropagation());

  render() {
    let showWrittenValue;
    if (this.props.writtenValue) {
      showWrittenValue = <div className="sub-header-h5 right">{this.props.writtenValue}</div>;
    }

    return (
      <div
        ref={(el) => { this.slider = el; }}
        className={
          cx('slider-container', this.props.className, this.state.modified ? 'modified' : '')}
      >
        <div className="slider-container-headers">
          <div className="left">
            <h4>{this.props.headerText}</h4>
          </div>
          {showWrittenValue}
        </div>
        <input
          id={this.props.id}
          className={cx('slider')}
          type="range"
          min={this.props.min}
          max={this.props.max}
          step={this.props.step}
          onMouseUp={(e) => { this.props.onSliderChange(e); }}
          onChange={(e) => { this.props.onSliderChange(e); }}
          value={this.props.value}
        />
        <span className="sub-header-h5 left">{this.props.minText}</span>
        <span className="sub-header-h5 right">{this.props.maxText}</span>
      </div>);
  }
}

export default Slider;
