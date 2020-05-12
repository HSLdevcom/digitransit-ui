import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import Autosuggest from 'react-autosuggest';
import ComponentUsageExample from './ComponentUsageExample';

function DesktopDatetimepicker({
  value,
  onChange,
  getDisplay,
  itemCount,
  itemDiff,
  startTime,
  validate,
  id,
  labelMessageId,
  icon,
}) {
  const [displayValue, changeDisplayValue] = useState(getDisplay(value));

  useEffect(() => changeDisplayValue(getDisplay(value)), [value]);

  // keep track of dropdown state for scroll position management
  const [open, changeOpen] = useState(false);
  const scrollRef = useRef(null);
  const scrollIndex = Math.floor((value - startTime) / itemDiff);
  const elementHeight = 50;
  // scroll to selected time when dropdown is opened
  useLayoutEffect(
    () => {
      if (open && scrollRef.current) {
        scrollRef.current.scrollTop = elementHeight * scrollIndex;
      }
    },
    [value, open],
  );

  const timeSuggestions = Array(itemCount)
    .fill()
    .map((_, i) => startTime + i * itemDiff);

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
      const validated = validate(newValue);
      if (validated) {
        handleTimestamp(validated);
      } else {
        return;
      }
    }
    handleTimestamp(newValue);
  };

  return (
    <>
      <Autosuggest
        id={id}
        suggestions={timeSuggestions}
        getSuggestionValue={s => s.toString()}
        renderSuggestion={s => getDisplay(s)}
        onSuggestionsFetchRequested={() => null}
        shouldRenderSuggestions={() => true}
        inputProps={{
          value: displayValue,
          onChange: onInputChange,
          onFocus: () => {
            changeOpen(true);
          },
          onBlur: () => {
            changeOpen(false);
          },
        }}
        focusInputOnSuggestionClick={false}
        onSuggestionsClearRequested={() => null}
        renderInputComponent={inputProps => {
          return (
            <label className="combobox-container" htmlFor={inputProps.id}>
              <span>
                <span className="combobox-label">
                  <FormattedMessage id={labelMessageId} />
                </span>
                <input {...inputProps} />
              </span>
              {icon}
            </label>
          );
        }}
        renderSuggestionsContainer={({ containerProps, children }) => {
          // set refs for autosuggest library and scrollbar positioning
          const { ref, ...otherRefs } = containerProps;
          const containerRef = elem => {
            if (elem) {
              scrollRef.current = elem;
              ref(elem);
            }
          };
          return (
            <div {...otherRefs} ref={containerRef}>
              {children}
            </div>
          );
        }}
      />
    </>
  );
  // TODO accessibility for focusonclick=false
}
DesktopDatetimepicker.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  getDisplay: PropTypes.func.isRequired,
  itemCount: PropTypes.number.isRequired,
  itemDiff: PropTypes.number.isRequired,
  startTime: PropTypes.number.isRequired,
  validate: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  labelMessageId: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};
DesktopDatetimepicker.description = <ComponentUsageExample />;

export default DesktopDatetimepicker;
