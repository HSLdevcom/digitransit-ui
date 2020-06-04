/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from '@digitransit-component/digitransit-component-icon';
import Autosuggest from 'react-autosuggest';
import styles from './MobileSearch.scss';

const MobileSearch = ({
  id,
  closeHandle,
  suggestions,
  inputProps,
  fetchFunction,
  renderSuggestion,
  getSuggestionValue,
  ariaLabel,
  label,
  onSuggestionSelected,
  clearOldSearches,
}) => {
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;

  const onSelect = (e, ref) => {
    if (ref.suggestion.type === 'clear-search-history') {
      clearOldSearches();
    } else {
      onSuggestionSelected(e, ref);
    }
  };

  const getValue = suggestion => {
    if (suggestion.type === 'clear-search-history') {
      return '';
    }
    return getSuggestionValue(suggestion);
  };

  const renderItem = item => {
    if (item.type === 'clear-search-history') {
      return (
        <span className={styles['clear-search-history']}>{item.labelId}</span>
      );
    }
    return renderSuggestion(item);
  };
  return (
    <div className={styles['fullscreen-root']}>
      <label className={styles['combobox-container']} htmlFor={inputId}>
        <div className={styles['combobox-icon']} onClick={closeHandle}>
          <Icon img="arrow" />
        </div>
        <span className={styles['right-column']}>
          <span className={styles['combobox-label']} id={labelId}>
            {label}
          </span>
          <Autosuggest
            alwaysRenderSuggestions
            id={id}
            suggestions={suggestions}
            onSuggestionsFetchRequested={fetchFunction}
            getSuggestionValue={getValue}
            renderSuggestion={renderItem}
            focusInputOnSuggestionClick={false}
            shouldRenderSuggestions={() => true}
            inputProps={{
              ...inputProps,
              onBlur: () => null,
              className: cx(
                `${styles.input} ${styles[id] || ''} ${
                  inputProps.value ? styles.hasValue : ''
                }`,
              ),
              autoFocus: true,
            }}
            renderInputComponent={p => (
              <input aria-label={ariaLabel} id={id} {...p} />
            )}
            theme={styles}
            onSuggestionSelected={onSelect}
          />
        </span>
      </label>
    </div>
  );
};

MobileSearch.propTypes = {
  id: PropTypes.string.isRequired,
  closeHandle: PropTypes.func.isRequired,
  suggestions: PropTypes.array.isRequired,
  inputProps: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
  }).isRequired,
  fetchFunction: PropTypes.func.isRequired,
  getSuggestionValue: PropTypes.func.isRequired,
  renderSuggestion: PropTypes.func.isRequired,
  onSuggestionSelected: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  clearOldSearches: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
};

export default MobileSearch;
