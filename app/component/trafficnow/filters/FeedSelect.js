import React, { useState } from 'react';
import cx from 'classnames';
import { useSelect, useTagGroup } from 'downshift';
import { useIntl } from 'react-intl';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { mapAlertSource } from '../../../util/alertUtils';
import Icon from '../../Icon';

function FeedSelect() {
  const config = useConfigContext();
  const { feedIds } = config;
  const { locale } = useIntl();
  const [selectedFeeds, setSelectedFeeds] = useState([]);

  const { addItem, getTagProps, getTagRemoveProps, getTagGroupProps, items } =
    useTagGroup({
      items: selectedFeeds,
      onItemsChange: ({ items: updatedItems }) =>
        setSelectedFeeds(updatedItems),
    });
  const toggleItem = item => {
    if (items.includes(item)) {
      setSelectedFeeds(items.filter(selectedItem => selectedItem !== item));
    } else {
      addItem(item);
    }
  };

  const { isOpen, getToggleButtonProps, getMenuProps, getItemProps } =
    useSelect({
      items: feedIds,
      itemToString: feedId => mapAlertSource(config, locale, feedId),
      onSelectedItemChange: ({ selectedItem }) => {
        if (selectedItem) {
          toggleItem(selectedItem);
        }
      },
      selectedItem: null,
      stateReducer: (_state, { changes, type }) => {
        if (
          changes.selectedItem &&
          type !== useSelect.stateChangeTypes.ToggleButtonBlur
        ) {
          return {
            ...changes,
            inputValue: '',
            highlightedIndex: 0,
            isOpen: true,
          };
        }
        return changes;
      },
    });

  return (
    <fieldset>
      <label className="input-legend">Näytä operaattoreista vain</label>
      <div className="filters-feed-select-container">
        <div className="filters-feed-select" {...getToggleButtonProps()}>
          <div className="selectedfeed-group" {...getTagGroupProps()}>
            {items.length ? (
              items.map((item, index) => (
                <div className="selectedfeed" key={item}>
                  <span {...getTagProps({ index })}>{item}</span>
                  <span {...getTagRemoveProps({ index })}>
                    <Icon img="icon_close-filled" />
                  </span>
                </div>
              ))
            ) : (
              <div className="selectedfeed-placeholder input-label">
                Valitse yksi tai useita
              </div>
            )}
          </div>
          <span>
            <Icon
              className={cx('dropdown-arrow', { inverted: isOpen })}
              img="icon_arrow-collapse"
            />
          </span>
        </div>
        <div
          className={cx('filters-feed-select-list', { hidden: !isOpen })}
          {...getMenuProps()}
        >
          {isOpen && (
            <ul>
              {feedIds.map((item, index) => (
                <li key={item} {...getItemProps({ item, index })}>
                  <input
                    type="checkbox"
                    checked={items.includes(item)}
                    onChange={() => toggleItem(item)}
                  />
                  <span className="input-label">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </fieldset>
  );
}

export default FeedSelect;
