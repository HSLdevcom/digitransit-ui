import PropTypes from 'prop-types';
import cx from 'classnames';
import React from 'react';
import { useSelect } from 'downshift';
import styles from './select.scss';

const Select = ({
  value,
  options,
  onSlackTimeSelected,
  viaPointIndex,
  id,
  label,
  icon,
}) => {
  const labelId = `${id}-label`;
  const selectedItem = options.find(option => option.value === value);

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    getLabelProps,
    highlightedIndex,
  } = useSelect({
    selectedItem,
    items: options,
    labelId,
    id,
    itemToString: item => item.displayName,
    onSelectedItemChange: ({ selectedItem: newItem }) => {
      onSlackTimeSelected(newItem.value, viaPointIndex);
    },
  });

  return (
    <div className={styles['combobox-container']}>
      <div className={styles.container}>
        <div {...getToggleButtonProps()}>
          <span className={styles['left-column']}>
            <label {...getLabelProps()} className={styles['combobox-label']}>
              {label}
            </label>
            <div className={styles.input}>
              <span>{selectedItem.displayName}</span>
            </div>
          </span>
          {icon}
        </div>
        <ul
          className={cx([styles.suggestionsContainerOpen, !isOpen && 'hidden'])}
          {...getMenuProps()}
        >
          {isOpen &&
            options.map((option, index) => (
              <li
                key={option.value}
                className={cx([
                  styles.suggestion,
                  index === highlightedIndex && styles.suggestionHighlighted,
                ])}
                {...getItemProps({ index })}
              >
                <span>{option.displayName}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

Select.propTypes = {
  value: PropTypes.number.isRequired,
  onSlackTimeSelected: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
  viaPointIndex: PropTypes.number.isRequired,
};

export default Select;
