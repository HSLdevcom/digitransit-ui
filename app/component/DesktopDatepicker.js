import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import Autosuggest from 'react-autosuggest';
import ComponentUsageExample from './ComponentUsageExample';

// TODO decide later if this and DesktopTimepicker should be merged
function DesktopDatepicker({ value, onChange, getDisplay }) {
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
      if (newValue.match(/[0-9]{1,2}\.[0-9]{1,2}\./) !== null) {
        // TODO check NaN
        const values = newValue.split('.');
        const date = Number(values[0]);
        // TODO check that numbers are in range
        const month = Number(values[1]);
        const newStamp = moment(value)
          .month(month - 1) // moment month is 0-indexed
          .date(date);
        handleTimestamp(newStamp);
      }
      return;
    }
    handleTimestamp(newValue);
  };
  const selected = moment(value);
  const dateSuggestions = Array(30)
    .fill()
    .map((_, i) =>
      moment()
        .hour(selected.hour())
        .minute(selected.minute())
        .add(i * 24, 'hours')
        .valueOf(),
    );
  return (
    <>
      <Autosuggest
        id="dateselector"
        suggestions={dateSuggestions}
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
            <div className="combobox-container">
              <label className="combobox-label" htmlFor={inputProps.id}>
                <FormattedMessage id="datetimepicker.date" />
                <input {...inputProps} />
              </label>
            </div>
          );
        }}
      />
    </>
  );
  // TODO accessibility for focusonclick=false
}
DesktopDatepicker.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  getDisplay: PropTypes.func.isRequired,
};
DesktopDatepicker.description = <ComponentUsageExample />;

export default DesktopDatepicker;
