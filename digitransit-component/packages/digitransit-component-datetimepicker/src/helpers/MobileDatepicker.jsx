import PropTypes from 'prop-types';
import React from 'react';
import { DateTime, Settings } from 'luxon';
import { useSelect } from 'downshift';
import cx from 'classnames';
import styles from './styles.scss';
import { isAndroid } from './mobileDetection';

const AndroidSelect = ({
  value,
  dateChoices,
  id,
  getDisplay,
  onChange,
  labelId,
  inputId,
}) => {
  const items = dateChoices.map(date => ({
    value: date,
    label: getDisplay(date),
  }));
  const selectedItem =
    items.find(option => option.value === value) || items[0] || null;
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
  } = useSelect({
    selectedItem,
    items,
    itemToString: item => item?.label ?? '',
    onSelectedItemChange: ({ selectedItem: nextSelectedItem }) => {
      if (nextSelectedItem) {
        onChange(nextSelectedItem.value);
      }
    },
    id,
  });

  return (
    <div className={styles.container}>
      <div
        {...getToggleButtonProps({ 'aria-labelledby': labelId, id: inputId })}
      >
        <div className={styles.input}>{selectedItem.label}</div>
      </div>
      <div
        className={cx([styles.suggestionsContainerOpen, !isOpen && 'hidden'])}
      >
        <ul {...getMenuProps()}>
          {isOpen &&
            items.map((option, index) => (
              <li
                key={option.value}
                className={cx([
                  styles.suggestion,
                  index === highlightedIndex && styles.suggestionHighlighted,
                ])}
                {...getItemProps({ index })}
              >
                <span>{option.label}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

AndroidSelect.propTypes = {
  value: PropTypes.number.isRequired,
  dateChoices: PropTypes.arrayOf(PropTypes.number).isRequired,
  id: PropTypes.string.isRequired,
  getDisplay: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  labelId: PropTypes.string.isRequired,
  inputId: PropTypes.string.isRequired,
};

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
  Settings.defaultZone = timeZone;
  const dateChoices = Array(itemCount)
    .fill()
    .map((_, i) => DateTime.fromMillis(startTime).plus({ days: i }).toMillis());
  const nativeInput = !isAndroid();
  const labelId = `${id}-label`;
  const inputId = `${id}-input`;

  return (
    <label className={styles['input-container']} htmlFor={inputId}>
      <span>{icon}</span>
      <span className={styles['sr-only']} id={labelId}>
        {label}
      </span>
      {nativeInput ? (
        <select
          id={inputId}
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
      ) : (
        <AndroidSelect
          {...{
            value,
            dateChoices,
            id,
            getDisplay,
            onChange,
            labelId,
            inputId,
          }}
        />
      )}
    </label>
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
  timeZone: PropTypes.string,
};

MobileDatepicker.defaultProps = {
  icon: null,
  timeZone: 'Europe/Helsinki',
};

export default MobileDatepicker;
