import PropTypes from 'prop-types';
import React, { useState, useRef, useLayoutEffect } from 'react';
import moment from 'moment-timezone';
import Autosuggest from 'react-autosuggest';
import styles from './styles.scss';
import { isAndroid } from './mobileDetection';

/**
 * Component to display a date input on mobile
 */
function MobileDatepicker({
  value,
  getDisplay,
  onChange,
  itemCount,
  startTime,
  id,
  label,
  icon,
  timeZone,
}) {
  moment.tz.setDefault(timeZone);

  const [open, changeOpen] = useState(false);
  const scrollRef = useRef(null);
  const dateChoices = Array(itemCount)
    .fill()
    .map((_, i) => moment(startTime).add(i, 'day').valueOf());
  const minute = 1000 * 60;
  const diffs = dateChoices.map(t => value - t);
  const scrollIndex = diffs.findIndex(t => t < minute); // when time is now, the times might differ by less than one minute
  const elementHeight = 50;
  // scroll to selected time when dropdown is opened
  useLayoutEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = elementHeight * scrollIndex;
    }
  }, [value, open]);
  const nativeInput = !isAndroid();
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  return (
    <>
      <label className={styles['input-container']} htmlFor={inputId}>
        <span>{icon}</span>
        <span className={styles['sr-only']} id={labelId}>
          {label}
        </span>
        {nativeInput ? (
          <>
            <select
              className={styles['mobile-input-display']}
              onChange={e => onChange(Number(e.target.value))}
              value={value}
            >
              {dateChoices.map(date => {
                return (
                  <option key={date} value={date}>
                    {getDisplay(date)}
                  </option>
                );
              })}
            </select>
          </>
        ) : (
          <Autosuggest
            id={id}
            suggestions={dateChoices}
            getSuggestionValue={s => s.toString()}
            renderSuggestion={s => getDisplay(s)}
            onSuggestionsFetchRequested={() => null}
            shouldRenderSuggestions={() => true}
            inputProps={{
              value: getDisplay(value),
              onChange: (_, { newValue }) => {
                onChange(Number(newValue));
              },
              onFocus: () => {
                changeOpen(true);
              },
              onBlur: () => {
                changeOpen(false);
              },
              id: inputId,
              'aria-labelledby': labelId,
              'aria-autocomplete': 'none',
              readOnly: true,
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
            theme={styles}
          />
        )}
      </label>
    </>
  );
}
MobileDatepicker.propTypes = {
  value: PropTypes.number.isRequired,
  getDisplay: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  itemCount: PropTypes.number.isRequired,
  startTime: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  dateTimeCombined: PropTypes.bool,
  timeZone: PropTypes.string,
};

MobileDatepicker.defaultProps = {
  icon: null,
  dateTimeCombined: false,
  timeZone: 'Europe/Helsinki',
};

export default MobileDatepicker;
