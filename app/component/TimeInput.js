import React, { Component, PropTypes } from 'react';

import debounce from 'lodash/debounce';
import padStart from 'lodash/padStart';

class TimeInput extends Component {
  state = {
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  };

  onChange = debounce(() => {
    let value = this.refs.time.value;
    value = value.replace(/[^0-9:]/g, '');
    let parts = value.split(':');
    if (parts.length === 1) {
      if (parts[0].length === 3) {
        parts = [parts[0][0], parts[0].substring(1)];
      } else {
        parts = [parts[0].substring(0, 2), parts[0].substring(2)];
      }
    }
    let hours = parts[0];
    let minutes = parts.length > 1 && parts[1];
    if (!hours || hours.length === 0 || hours.length > 2) return;
    if (!minutes || minutes.length === 0 || minutes.length > 2) return;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    if (isNaN(hours) || hours < 0 || hours > 23) return;
    if (isNaN(minutes) || minutes < 0 || minutes > 59) return;
    this.setState({
      hours,
      minutes,
    }, () => {
      this.props.changeTime({ target: { value: `${this.state.hours} ${this.state.minutes}` } });
    });
  }, 500);

  render() {
    return (
      <input
        ref="time"
        name="time"
        type="text"
        className="text-time-selector"
        defaultValue={`${padStart(this.state.hours, 2, '0')}:${padStart(this.state.minutes, 2, '0')}`}
        onChange={this.onChange}
        onClick={() => { this.refs.time.select(); }}
        maxLength="5"
        style={{
          display: 'inline-block',
        }}
      />
    );
  }
}

TimeInput.propTypes = {
  changeTime: PropTypes.func.isRequired,
};

export default TimeInput;
