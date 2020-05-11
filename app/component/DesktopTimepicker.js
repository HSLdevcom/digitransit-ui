import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import Autosuggest from 'react-autosuggest';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';

// TODO decide later if this and DesktopDatepicker should be merged
function DesktopTimepicker({ value, onChange, getDisplay }) {
  const [displayValue, changeDisplayValue] = useState(getDisplay(value));

  useEffect(() => changeDisplayValue(getDisplay(value)), [value]);

  // newValue is string
  const handleTimestamp = newValue => {
    const asNumber = Number(newValue);
    if (
      Number.isNaN(asNumber) ||
      !moment(asNumber).isValid() ||
      moment(asNumber).valueOf() !== asNumber
    ) {
      // TODO handle error?
      return;
    }
    onChange(asNumber);
  };
  // TODO show error when invalid value left in?
  // newValue is string
  const onInputChange = (_, { newValue, method }) => {
    if (method === 'type') {
      // TODO improve validation
      changeDisplayValue(newValue);
      if (newValue.match(/[0-9]{1,2}(\.|:)[0-9]{2}/) !== null) {
        const splitter = newValue.includes('.') ? '.' : ':';
        const values = newValue.split(splitter);
        // TODO check NaN
        const hours = Number(values[0]);
        const minutes = Number(values[1]);
        // TODO check that numbers are in range
        const newStamp = moment(value)
          .hours(hours)
          .minutes(minutes)
          .valueOf();
        handleTimestamp(newStamp);
      }
      return;
    }
    handleTimestamp(newValue);
  };

  const timeSuggestions = Array(4 * 24)
    .fill()
    .map((_, i) =>
      moment(value)
        .startOf('day')
        .add(i * 15, 'minutes')
        .valueOf(),
    );
  return (
    <>
      <Autosuggest
        id="timeselector"
        suggestions={timeSuggestions}
        getSuggestionValue={s => s.toString()}
        renderSuggestion={s => getDisplay(s)}
        onSuggestionsFetchRequested={() => null}
        shouldRenderSuggestions={() => true}
        inputProps={{
          value: displayValue,
          onChange: onInputChange,
        }}
        focusInputOnSuggestionClick={false}
        onSuggestionsClearRequested={() => null}
        renderInputComponent={inputProps => {
          return (
            <label className="combobox-container" htmlFor={inputProps.id}>
              <span>
                <span className="combobox-label">
                  <FormattedMessage id="datetimepicker.time" />
                </span>
                <input {...inputProps} />
              </span>
              <span className="combobox-icon time-input-icon">
                <Icon img="icon-icon_time" viewBox="0 0 16 16" />
              </span>
            </label>
          );
        }}
      />
    </>
  );
  // TODO accessibility for focusonclick=false
}
DesktopTimepicker.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  getDisplay: PropTypes.func.isRequired,
};
DesktopTimepicker.description = <ComponentUsageExample />;

export default DesktopTimepicker;
