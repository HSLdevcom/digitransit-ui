import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';

class ItineraryTimePicker extends React.Component {
  static propTypes = {
    changeTime: PropTypes.func.isRequired,
    initHours: PropTypes.string.isRequired,
    initMin: PropTypes.string.isRequired,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static DELTAS = { 38: 1, 40: -1 };

  constructor(props) {
    super(props);
    this.state = {
      hour: this.padDigits(props.initHours),
      minute: this.padDigits(props.initMin),
    };
  }

  componentWillReceiveProps({ initHours: nextHours, initMin: nextMin }) {
    const { initHours, initMin } = this.props;
    if (initHours !== nextHours || initMin !== nextMin) {
      this.setState({
        hour: this.padDigits(nextHours),
        minute: this.padDigits(nextMin),
      });
    }
  }

  onChangeHour = e => {
    let val = e.target.value;

    // allow clearing
    if (val === '') {
      this.setState({ hour: val });
      return;
    }

    if (/^\d+$/.test(val)) {
      const hour = parseInt(val, 10);
      if (val.length === 2 || hour > 3) {
        if (hour > 23) {
          // entered hour was > 23, use 2nd digit only
          val = val.substring(1);
        }
        // set state && auto move to minutes
        this.setState({ hour: val }, () => {
          this.minEl.focus();
          setTimeout(() => {
            this.minEl.setSelectionRange(0, 2);
          }, 0);
        });
        return;
      }
      this.setState({ hour: val });
    }
  };

  onChangeMinute = e => {
    let val = e.target.value;
    // allow clearing
    if (val === '') {
      this.setState({ minute: val });
      return;
    }

    if (/^\d+$/.test(val)) {
      const minute = parseInt(val, 10);
      if (val.length === 2 || minute > 5) {
        if (minute > 59) {
          // entered hour was > 23, use 2nd digit only
          val = val.substring(1);
        }
        // set state && auto blur
        this.setState({ minute: val }, () => {
          this.minEl.blur();
        });
        return;
      }
      this.setState({ minute: val });
    }
  };

  setSelectionRange = e => e.target.setSelectionRange(0, 2);

  /** arrow down + up hour * */
  handleKeyDownHour = event => {
    const delta = ItineraryTimePicker.DELTAS[event.keyCode];
    if (delta) {
      this.props.changeTime({
        add: { key: 'hours', delta },
      });
    }
  };

  /** arrow down + up minute * */
  handleKeyDownMinute = event => {
    const delta = ItineraryTimePicker.DELTAS[event.keyCode];
    if (delta) {
      this.props.changeTime({
        add: { key: 'minutes', delta },
      });
    }
  };

  handleBlur = () => {
    if (this.state.hour === '') {
      // restore old value when blurring empty
      this.setState({ hour: this.padDigits(this.props.initHours) });
      return;
    }

    if (this.state.minute === '') {
      // restore old value when blurring empty
      this.setState({ minute: this.padDigits(this.props.initMin) });
      return;
    }
    // check if value has changed, if so dispatch url change
    if (
      parseInt(this.props.initHours, 10) !== parseInt(this.state.hour, 10) ||
      parseInt(this.props.initMin, 10) !== parseInt(this.state.minute, 10)
    ) {
      // time has been changed
      this.props.changeTime({
        hours: this.state.hour,
        minutes: this.state.minute,
      });
    }
  };

  // Pad Digits to create leading zero in case of single-digit numbers
  padDigits = digit => {
    const testDigit = digit.toString();
    return testDigit.length === 1 ? `0${testDigit}` : testDigit;
  };

  render() {
    const { hour, minute } = this.state;
    return (
      <div className="time-input-container time-selector">
        <form
          aria-label={this.context.intl.formatMessage({
            id: 'time-selector-form',
            defaultMessage: 'Edit time',
          })}
          id="time"
          onBlur={this.handleBlur}
        >
          <input
            type="tel"
            id="inputHours"
            className="time-input-field"
            value={hour}
            maxLength={2}
            onChange={this.onChangeHour}
            onClick={this.setSelectionRange}
            onKeyDown={this.handleKeyDownHour}
            aria-label={this.context.intl.formatMessage({
              id: 'time-selector-hours-label',
            })}
          />
          <div id="timeinput-digit-separator" aria-hidden="true">
            :
          </div>
          <input
            type="tel"
            ref={el => {
              if (el !== null) {
                this.minEl = el;
              }
            }}
            id="inputMinutes"
            className="time-input-field"
            value={minute}
            maxLength={2}
            onChange={this.onChangeMinute}
            onClick={this.setSelectionRange}
            onKeyDown={this.handleKeyDownMinute}
            aria-label={this.context.intl.formatMessage({
              id: 'time-selector-minutes-label',
            })}
          />
        </form>
      </div>
    );
  }
}

const recomposed = onlyUpdateForKeys(['initMin', 'initHours'])(
  ItineraryTimePicker,
);
export { recomposed as default, ItineraryTimePicker as Component };
