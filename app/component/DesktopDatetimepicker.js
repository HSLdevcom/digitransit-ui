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
  disableTyping,
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

  // only enter or click will trigger actual change of value
  // if user first types something in field and then selects an item from list, both 'inputenter' and 'enter' events will trigger, this needs to be handled.
  const onInputChange = (_, { newValue, method }) => {
    let validated;
    switch (method) {
      case 'type':
        if (!disableTyping) {
          changeDisplayValue(newValue);
        }
        break;
      case 'inputenter':
        validated = validate(newValue);
        if (validated !== null) {
          handleTimestamp(validated);
        } else {
          // TODO handle invalid input?
        }
        break;
      case 'enter':
      case 'click':
        handleTimestamp(newValue);
        break;
      case 'escape':
        changeDisplayValue(getDisplay(value));
        break;
      case 'up':
      case 'down':
      default:
        break;
    }
  };
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  return (
    <>
      <label className="combobox-container" htmlFor={inputId}>
        <span className="left-column">
          <span className="combobox-label" id={labelId}>
            <FormattedMessage id={labelMessageId} />
          </span>
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
                changeDisplayValue(getDisplay(value));
              },
              onKeyDown: e => {
                if (e.keyCode === 13) {
                  if (e.target.value !== getDisplay(value)) {
                    // this means user probably typed something
                    onInputChange(e, {
                      newValue: e.target.value,
                      method: 'inputenter',
                    });
                  }
                }
              },
              id: inputId,
              'aria-labelledby': labelId,
              'aria-autocomplete': 'none',
              readOnly: disableTyping,
            }}
            focusInputOnSuggestionClick={false}
            onSuggestionsClearRequested={() => null}
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
                <div tabIndex="-1" {...otherRefs} ref={containerRef}>
                  {children}
                </div>
              );
            }}
          />
        </span>
        {icon}
      </label>
    </>
  );
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
  disableTyping: PropTypes.bool,
};

DesktopDatetimepicker.defaultProps = {
  disableTyping: false,
};

DesktopDatetimepicker.description = <ComponentUsageExample />;

export default DesktopDatetimepicker;
