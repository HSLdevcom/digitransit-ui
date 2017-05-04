import React, { PropTypes } from 'react';
import { isMobile } from '../util/browser';

export default class ItineraryTimePicker extends React.Component {
  static propTypes = {
    changeTime: PropTypes.func.isRequired,
    initHours: PropTypes.string.isRequired,
    initMin: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      hours: this.props.initHours,
      minutes: this.props.initMin,
      lastKey: 0,
      oldHour: this.props.initHours,
      oldMinute: this.props.initMin,
    };
    this.onChangeMinutes = this.onChangeMinutes.bind(this);
    this.onChangeHours = this.onChangeHours.bind(this);
  }

  onChangeHours(event) {
    // If backspace is pressed, erase the value
    if (this.state.lastKey === 8 || this.state.lastKey === 46) {
      this.setState({
        hours: 0,
      });
      return;
    }
    // Accept only numbers
    if (/^\d+$/.test(event.target.value)) {
      const hourInput = this.checkZero(event.target.value);
      if (hourInput.length < 3) {
        // Clean up the input
        const hours = hourInput.length > 1
          ? this.fixDigits({
            val: hourInput,
            max: 23,
          })
          : hourInput;
        this.setState({
          hours,
          oldHour: hours,
        });
        // Send new time request
        this.props.changeTime({ target: { value: `${hours} ${this.state.minutes}` } });
      } else if (hourInput.length === 3) {
        this.setState({
          hours: event.target.value.slice(-1),
          oldHour: event.target.value.slice(-1),
        });
      } else {
        this.hourEl.value = this.state.hours;
      }
    }
  }

  onChangeMinutes(event) {
    // If backspace is pressed, erase the value
    if (this.state.lastKey === 8 || this.state.lastKey === 46) {
      this.setState({
        minutes: 0,
      });
      return;
    }
    // Accept only numbers
    if (/^\d+$/.test(event.target.value)) {
      // Clean up the input
      const minuteInput = this.checkZero(event.target.value);
      if (minuteInput.length < 3) {
        const minutes = minuteInput.length > 1
            ? this.fixDigits({
              val: minuteInput,
              max: 59,
            })
            : minuteInput;
        this.setState({
          minutes,
          oldMinute: minutes,
        });
        // Send new time request
        this.props.changeTime({ target: { value: `${this.state.hours} ${minutes}` } });
      } else if (minuteInput.length === 3) {
        this.setState({
          minutes: event.target.value.slice(-1),
          oldMinute: event.target.value.slice(-1),
        });
      } else {
        this.minEl.value = this.state.minutes;
      }
    }
  }

  fixDigits = digit => ((digit.val.length === 2 && digit.val > digit.max) ? 0 : this.padDigits(digit.val));

  checkZero = digit => (digit.charAt(0) === '0' && digit.length > 2 ? digit.substr(1) : digit);

  checkInt = val => (typeof val !== 'string' ? val : parseInt(val, 10));

  toggleHours = (event) => {
    let hours = this.checkInt(this.hourEl.value);
    if (event.keyCode === 38) { // Up
      hours = hours < 23 ? hours + 1 : 0;
    }
    if (event.keyCode === 40) { // Down
      hours = hours !== 0 ? hours - 1 : 23;
    }
    this.setState({
      hours,
    });
    // Send new time request
    this.props.changeTime({ target: { value: `${hours} ${this.state.minutes}` } });
  }

  toggleMinutes = (event) => {
    let minutes = this.checkInt(this.minEl.value);
    if (event.keyCode === 38) { // Up
      minutes = minutes < 59 ? minutes + 1 : 0;
    }
    if (event.keyCode === 40) { // Down
      minutes = minutes !== 0 ? minutes - 1 : 59;
    }
    this.setState({
      minutes,
    });
    // Send new time request
    this.props.changeTime({ target: { value: `${this.state.hours} ${minutes}` } });
  }

  handleBlur = (event) => {
    // If user erased the input by backspace/delete, return the original value
    if (this.state.lastKey === 8 || this.state.lastKey === 46) {
      if (event.target.id === 'inputHours') {
        this.setState({
          hours: this.state.oldHour,
        });
      }
      if (event.target.id === 'inputMinutes') {
        this.setState({
          minutes: this.state.oldMinute,
        });
      }
    }
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 8 || event.keyCode === 46) {
      if (event.target.id === 'inputHours') {
        this.setState({
          hours: 0,
        });
      }
      if (event.target.id === 'inputMinutes') {
        this.setState({
          minutes: 0,
        });
      }
    } else {
      if (event.target.id === 'inputHours') {
        this.toggleHours(event);
      }
      if (event.target.id === 'inputMinutes') {
        this.toggleMinutes(event);
      }
    }
    // Set the last key to make it accessible for onchange event
    this.setState({
      lastKey: event.keyCode,
    });
  }

// Pad Digits to create leading zero in case of single-digit numbers
  padDigits = (digit) => {
    const testDigit = digit.toString();
    return testDigit.length === 1 ? `0${testDigit}` : testDigit;
  }

  render() {
    return (
      <div
        className={`time-input-container time-selector ${!isMobile ? 'time-selector' : ''}`}
      >
        <input
          type="text"
          ref={el => (this.hourEl = el)}
          id="inputHours"
          className="time-input-field"
          value={
            this.state.hours > 9
              ? this.state.hours
              : this.padDigits(parseInt(this.state.hours, 10))
          }
          maxLength={3}
          onClick={e => e.target.setSelectionRange(0, 2)}
          onChange={this.onChangeHours}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
        />
        <div className="digit-separator">:</div>
        <input
          type="text"
          ref={el => (this.minEl = el)}
          id="inputMinutes"
          className="time-input-field"
          value={
            this.state.minutes > 9
              ? this.state.minutes
              : this.padDigits(this.state.minutes)
          }
          maxLength={3}
          onClick={e => e.target.setSelectionRange(0, 2)}
          onChange={this.onChangeMinutes}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
        />
      </div>
    );
  }
}
