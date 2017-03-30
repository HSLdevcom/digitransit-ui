import React, { Component, PropTypes } from 'react';

import debounce from 'lodash/debounce';

const parseValue = (x) => {
  const value = x.replace(/[^0-9:]/g, '');
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
  if (!hours || hours.length === 0 || hours.length > 2) return { };
  if (!minutes || minutes.length === 0 || minutes.length > 2) return { };
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  if (isNaN(hours) || hours < 0 || hours > 23) return { };
  if (isNaN(minutes) || minutes < 0 || minutes > 59) return { };

  return { parsed: true, hours, minutes };
};

class TimeInput extends Component {
  componentWillUpdate(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.time.value = nextProps.value;
    }
  }

  onChange = debounce(() => {
    const { parsed, hours, minutes } = parseValue(this.time.value);
    if (parsed) {
      console.log('callback');
      this.props.changeTime({ target: { value: `${hours} ${minutes}` } });
    }
  }, 1000);

  render() {
    return (
      <input
        ref={(el) => { this.time = el; }}
        name="time"
        type="text"
        className="text-time-selector"
        defaultValue={this.props.value}
        onChange={this.onChange}
        onFocus={() => { this.time.select(); }}
        maxLength="5"
        size="5"
        style={{
          display: 'inline-block',
          cursor: 'text',
        }}
      />
    );
  }
}

TimeInput.propTypes = {
  value: PropTypes.string.isRequired,
  changeTime: PropTypes.func.isRequired,
};

export default TimeInput;
