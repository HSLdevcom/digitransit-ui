import React, { useCallback } from 'react';
import cx from 'classnames';
import { useSelect, useTagGroup } from 'downshift';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Icon, CloseS, ArrowUpS, ArrowDownS, CloseFilled } from '@hsl-fi/icons';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useFilterContext } from './FiltersContext';

function OperatorSelectDropdown({ availableOperators = [], itemToString }) {
  const { formatMessage } = useIntl();

  const {
    selectedFilters: { selectedFeeds },
    setFilter,
  } = useFilterContext();
  const setSelectedFeeds = feeds => setFilter('selectedFeeds', feeds);

  const { getTagProps, getTagRemoveProps, getTagGroupProps, items } =
    useTagGroup({
      items: selectedFeeds,
      onItemsChange: ({ items: updatedItems }) =>
        setSelectedFeeds(updatedItems),
    });

  const toggleItem = item => {
    if (items.includes(item)) {
      setSelectedFeeds(items.filter(selectedItem => selectedItem !== item));
    } else {
      setSelectedFeeds([...items, item]);
    }
  };

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
  } = useSelect({
    items: availableOperators,
    itemToString,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        toggleItem(selectedItem);
      }
    },
    selectedItem: null,
    stateReducer: (_state, { changes, type }) => {
      if (type === useSelect.stateChangeTypes.ToggleButtonBlur) {
        return {
          ...changes,
          selectedItem: null,
        };
      }
      if (changes.selectedItem) {
        return {
          ...changes,
          highlightedIndex: _state.highlightedIndex,
          isOpen: true,
        };
      }
      return changes;
    },
  });

  return (
    <fieldset>
      <legend className="input-legend">
        {formatMessage({
          id: 'traffic-now_filters_operator-select-legend',
          defaultMessage: 'Show only these operators',
        })}
      </legend>
      <div className="traffic-now__filters-operator-select-container">
        <div
          className="traffic-now__filters-operator-select"
          {...getToggleButtonProps()}
        >
          <div
            className="traffic-now__filters-selected-feeds"
            {...getTagGroupProps()}
          >
            {items.length ? (
              items.map((item, index) => (
                <div className="traffic-now__filters-selected-feed" key={item}>
                  <span {...getTagProps({ index })}>{itemToString(item)}</span>
                  <div
                    {...getTagRemoveProps({ index })}
                    style={{ display: 'flex', margin: 'auto' }}
                  >
                    <Icon icon={CloseFilled} size="s" color="accent" />
                  </div>
                </div>
              ))
            ) : (
              <div className="traffic-now__filters-selected-feed-placeholder input-label">
                {formatMessage({
                  id: 'traffic-now_filters_operator-select-placeholder',
                  defaultMessage: 'Select one or more',
                })}
              </div>
            )}
          </div>
          <span className="traffic-now__filters-operator-select-buttons">
            {selectedFeeds.length > 0 && (
              <button
                aria-label={formatMessage({
                  id: 'clear-button-label',
                  defaultMessage: 'Clear',
                })}
                type="button"
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedFeeds([]);
                    e.stopPropagation();
                  }
                }}
                onClick={e => {
                  setSelectedFeeds([]);
                  e.stopPropagation();
                }}
              >
                <Icon icon={CloseS} size="m" color="accent" />
              </button>
            )}
            <span style={{ display: 'flex', margin: 'auto' }}>
              <Icon
                icon={isOpen ? ArrowUpS : ArrowDownS}
                size="s"
                color="accent"
              />
            </span>
          </span>
        </div>
        <div
          className={cx('traffic-now__filters-operator-select-list', {
            hidden: !isOpen,
          })}
          {...getMenuProps()}
        >
          {isOpen && (
            <ul>
              {availableOperators.map((item, index) => (
                <li
                  className={cx(
                    'traffic-now__filters-operator-select-list-item',
                    { highlighted: highlightedIndex === index },
                  )}
                  key={item}
                  {...getItemProps({ item, index })}
                >
                  <input
                    type="checkbox"
                    checked={items.includes(item)}
                    readOnly
                  />
                  <span className="input-label">{itemToString(item)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </fieldset>
  );
}

OperatorSelectDropdown.propTypes = {
  availableOperators: PropTypes.arrayOf(PropTypes.string),
  itemToString: PropTypes.func.isRequired,
};

function OperatorSelect() {
  const { feedIds = [], sourceForAlertsAndDisruptions = {} } =
    useConfigContext();
  const { locale } = useIntl();

  const itemToString = useCallback(
    feed =>
      sourceForAlertsAndDisruptions[feed]
        ? sourceForAlertsAndDisruptions[feed][locale]
        : null,
    [sourceForAlertsAndDisruptions, locale],
  );

  // filter out feeds from selection that do not have mapping to operators
  const availableOperators = feedIds.filter(itemToString);

  // if one or less operators to select from, dont render
  return (
    availableOperators.length > 1 && (
      <OperatorSelectDropdown
        availableOperators={availableOperators}
        itemToString={itemToString}
      />
    )
  );
}

export default OperatorSelect;
