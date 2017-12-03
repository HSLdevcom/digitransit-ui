import PropTypes from 'prop-types';
import React from 'react';
import { isMobile } from '../util/browser';

export default class ItineraryTimePicker extends React.Component {
  static propTypes = {
    changeTime: PropTypes.func.isRequired,
    initHours: PropTypes.string.isRequired,
    initMin: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = this.getState(props, {});
  }

  componentWillReceiveProps({ initHours, initMin }) {
    if (
      Number(this.state.initHours) !== Number(initHours) ||
      Number(this.state.initMin) !== Number(initMin)
    ) {
      this.setState({
        initHours: this.padDigits(initHours),
        initMin: this.padDigits(initMin),
      });
    }
  }

  onChangeTime = event => {
    const isHour = this.isHours(event.target.id);
    const timePropertyId = isHour ? 'hours' : 'minutes';
    const focusropertyId = isHour ? 'focusHours' : 'focusMinutes';

    if (this.state[focusropertyId] === true) {
      // just focused, accept 1 digit
      if (event.target.value === '') {
        this.setState({
          [focusropertyId]: false,
          [timePropertyId]: event.target.value,
        });
        return;
      }
      this.setState({ [focusropertyId]: false });
    }
    // accept empty value
    if (event.target.value === '') {
      this.setState({
        [timePropertyId]: event.target.value,
      });
      return;
    }
    // Accept only numbers
    if (/^\d+$/.test(event.target.value)) {
      // Check if there's a leading zero
      const input = this.checkZero(event.target.value);
      if (input.length < 3) {
        // Clean up the input
        const newTime =
          input.length > 1
            ? this.fixDigits({
                val: input,
                max: isHour ? 23 : 59,
              })
            : input;
        // Send new time request
        const requestString = isHour
          ? `${newTime} ${this.state.minutes}`
          : `${this.state.hours} ${newTime}`;
        this.props.changeTime({ target: { value: requestString } }, () => {
          // If set hours are 3-9 or two digits, switch to minute input
          if (
            (newTime.length === 2 || (newTime < 10 && newTime > 2)) &&
            isHour
          ) {
            // move to minutes field
            this.hourEl.blur();
            this.minEl.focus();
            setTimeout(() => {
              this.minEl.setSelectionRange(0, 2);
            }, 0);
          }
        });
        this.setState({
          [timePropertyId]: newTime,
        });
      }
    }
  };

  onBlur = (stateName, newValue, oldValue) => {
    if (newValue === '') {
      // restore old
      this.setState({ [stateName]: oldValue });
    } else {
      this.setState({ [stateName]: this.padDigits(newValue) });
    }
  };

  setSelectionRange = e => e.target.setSelectionRange(0, 2);

  getState = ({ initHours, initMin }, currentState) => {
    const newState = {
      oldHour: this.padDigits(initHours),
      oldMinute: this.padDigits(initMin),
    };

    if (Number(currentState.hours) !== Number(initHours)) {
      newState.hours = this.padDigits(initHours);
    }
    if (Number(currentState.minutes) !== Number(initMin)) {
      newState.minutes = this.padDigits(initMin);
    }
    return newState;
  };

  toggleTime = event => {
    const isHour = this.isHours(event.target.id);
    const id = this.stateId(event.target.id);
    const max = isHour ? 23 : 59;
    const newTime = this.checkInt(event.target.value);
    let newChanges;
    if (event.keyCode === 38) {
      // Up
      newChanges = this.constructToggle({
        time: newTime < max ? newTime + 1 : 0,
        id,
        max,
        add: 1,
      });
    }
    if (event.keyCode === 40) {
      // Down
      newChanges = this.constructToggle({
        time: newTime !== 0 ? newTime - 1 : max,
        id,
        max,
        add: -1,
      });
    }
    this.setState(newChanges.toggledState);
    this.props.changeTime({ target: { value: newChanges.requestString } });
  };

  constructToggle = val => {
    let toggledState;
    let requestString;
    if (
      val.id === 'minutes' &&
      ((val.time === 0 && val.add === 1) || (val.time === 59 && val.add === -1))
    ) {
      // If the minute value is increased so it loops to the min value, add one hour
      // If the minute value is decreased so it loops to the max value, reduce one hour
      const toggledHour =
        this.state.hours < 1 ? 23 : parseInt(this.state.hours, 10) + val.add;
      toggledState = {
        hours: toggledHour < 0 ? 23 : toggledHour,
        minutes: val.time,
      };
      requestString = `${parseInt(this.state.hours, 10) + val.add} ${val.time}`;
    } else {
      toggledState = {
        [val.id]: val.time,
      };
      requestString =
        val.id === 'hours'
          ? `${val.time} ${this.state.minutes}`
          : `${this.state.hours} ${val.time}`;
    }
    return { toggledState, requestString };
  };

  handleKeyDown = event => {
    if (event.keyCode === 38 || event.keyCode === 40) {
      // up or down
      this.toggleTime(event);
    }
  };

  fixDigits = digit =>
    digit.val.length === 2 && digit.val > digit.max
      ? digit.val.substr(1)
      : this.padDigits(digit.val);

  checkZero = digit =>
    digit.charAt(0) === '0' && digit.length > 2 ? digit.substr(1) : digit;

  checkInt = val => (typeof val !== 'string' ? val : parseInt(val, 10));

  isHours = id => id === 'inputHours';
  isMinutes = id => !this.isHours(id);
  stateId = id => (this.isHours(id) ? 'hours' : 'minutes');

  handleBlur = event => {
    const isHour = this.isHours(event.target.id);
    if (isHour) {
      this.onBlur('hours', event.target.value, this.state.oldHour);
    } else {
      this.onBlur('minutes', event.target.value, this.state.oldMinute);
    }
  };

  handleFocus = event => {
    const isHour = this.isHours(event.target.id);
    if (isHour) {
      this.setState({
        focusHours: true,
      });
    } else {
      this.setState({
        focusMinutes: true,
      });
    }
  };

  // Pad Digits to create leading zero in case of single-digit numbers
  padDigits = digit => {
    const testDigit = digit.toString();
    return testDigit.length === 1 ? `0${testDigit}` : testDigit;
  };

  render() {
    return (
      <div
        className={`time-input-container time-selector ${
          !isMobile ? 'time-selector' : ''
        }`}
      >
        <input
          type="tel"
          ref={el => {
            if (el !== null) {
              this.hourEl = el;
            }
          }}
          id="inputHours"
          className="time-input-field"
          value={this.state.hours}
          maxLength={2}
          onChange={this.onChangeTime}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          onClick={this.setSelectionRange}
          onKeyDown={this.handleKeyDown}
        />
        <div className="digit-separator">:</div>
        <input
          type="tel"
          ref={el => {
            if (el !== null) {
              this.minEl = el;
            }
          }}
          id="inputMinutes"
          className="time-input-field"
          value={this.state.minutes}
          maxLength={2}
          onChange={this.onChangeTime}
          onClick={this.setSelectionRange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
        />
      </div>
    );
  }
}
