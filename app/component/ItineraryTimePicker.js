import React, { PropTypes } from 'react';
import { isMobile, isAndroid, isChrome } from '../util/browser';

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
    this.onChangeTime = this.onChangeTime.bind(this);
  }

  onChangeTime(event) {
    // If backspace is pressed, erase the value
    const timePropertyId = event.target.id === 'inputHours' ? 'hours' : 'minutes';
    const oldPropertyId = event.target.id === 'inputHours' ? 'oldHour' : 'oldMinute';
    if (this.state.lastKey === 8 || this.state.lastKey === 46) {
      this.setState({
        [timePropertyId]: 0,
      });
      return;
    }
    // Accept only numbers
    if (/^\d+$/.test(event.target.value)) {
      // Check if there's a leading zero
      const input = this.checkZero(event.target.value);
      if (input.length < 3) {
        // Clean up the input
        const newTime = input.length > 1
          ? this.fixDigits({
            val: input,
            max: timePropertyId === 'hours' ? 23 : 59,
          })
          : input;
        this.setState({
          [timePropertyId]: newTime,
          [oldPropertyId]: newTime,
        });
        // Send new time request
        const requestString = timePropertyId === 'hours' ? `${newTime} ${this.state.minutes}` : `${this.state.hours} ${newTime}`;
        this.props.changeTime({ target: { value: requestString } });
        // If set hours are 3-9 or two digits, switch to minute input
        if ((newTime.length === 2 || (newTime < 10 && newTime > 2)) && timePropertyId === 'hours') {
          this.minEl.focus();
          this.minEl.setSelectionRange(0, 2);
        }
      } else if (input.length === 3) {
        this.setState({
          [timePropertyId]: event.target.value.slice(-1),
          [oldPropertyId]: event.target.value.slice(-1),
        });
      } else {
        this.event.target.value = this.state[timePropertyId];
      }
    }
  }

  fixDigits = digit => (
    (digit.val.length === 2 && digit.val > digit.max) ? digit.val.substr(1)
    : this.padDigits(digit.val)
    );

  checkZero = digit => (digit.charAt(0) === '0' && digit.length > 2 ? digit.substr(1) : digit);

  checkInt = val => (typeof val !== 'string' ? val : parseInt(val, 10));

  constructToggle = (val) => {
    let toggledState;
    let requestString;
    if (val.id === 'minutes' && (val.time === 0 || val.time === 59)) {
    // If the minute value is increased so it loops to the min value, add one hour
    // If the minute value is decreased so it loops to the max value, reduce one hour
      const toggledHour = (this.state.hours < 1 ? 23 : parseInt(this.state.hours, 10) + val.add);
      toggledState = {
        hours: toggledHour < 0 ? 23 : toggledHour,
        minutes: val.time,
      };
      requestString = `${parseInt(this.state.hours, 10) + val.add} ${val.time}`;
    } else {
      toggledState = {
        [val.id]: val.time,
      };
      requestString = val.id === 'hours' ? `${val.time} ${this.state.minutes}` : `${this.state.hours} ${val.time}`;
    }
    return { toggledState, requestString };
  }

  toggleTime = (event) => {
    const id = event.target.id === 'inputHours' ? 'hours' : 'minutes';
    const max = id === 'hours' ? 23 : 59;
    const newTime = this.checkInt(event.target.value);
    let newChanges;
    if (event.keyCode === 38) { // Up
      newChanges = this.constructToggle({
        time: newTime < max ? newTime + 1 : 0,
        id,
        max,
        add: 1,
      });
    }
    if (event.keyCode === 40) { // Down
      newChanges = this.constructToggle({
        time: newTime !== 0 ? newTime - 1 : max,
        id,
        max,
        add: -1,
      });
    }
    this.setState(newChanges.toggledState);
    this.props.changeTime({ target: { value: newChanges.requestString } });
  }

  handleBlur = (event) => {
    // If user erased the input by backspace/delete, return the original value
    if (
      this.state.lastKey === 8 ||
      this.state.lastKey === 46 ||
      (this.state.lastKey === 229 && isAndroid && isChrome)
    ) {
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
    } else {
      const id = event.target.id === 'inputHours' ? 'hours' : 'minutes';
      this.setState({
        [id]: this.padDigits(event.target.value),
      });
    }
  }

  handleKeyDown = (event) => {
    if (
      event.keyCode === 8 ||
      event.keyCode === 46 ||
      (event.keyCode === 229 && isAndroid && isChrome)
    ) {
      if (event.target.id === 'inputHours') {
        this.setState({
          hours: '',
        });
      }
      if (event.target.id === 'inputMinutes') {
        this.setState({
          minutes: '',
        });
      }
    }
    if (event.keyCode === 38 || event.keyCode === 40) {
      // If up or down key is pressed call toggleTime
      this.toggleTime(event);
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
          type="tel"
          ref={el => (this.hourEl = el)}
          id="inputHours"
          className="time-input-field"
          value={this.state.hours}
          maxLength={3}
          onClick={e => e.target.setSelectionRange(0, 2)}
          onChange={this.onChangeTime}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
        />
        <div className="digit-separator">:</div>
        <input
          type="tel"
          ref={el => (this.minEl = el)}
          id="inputMinutes"
          className="time-input-field"
          value={this.state.minutes}
          maxLength={3}
          onClick={e => e.target.setSelectionRange(0, 2)}
          onChange={this.onChangeTime}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
        />
      </div>
    );
  }
}
