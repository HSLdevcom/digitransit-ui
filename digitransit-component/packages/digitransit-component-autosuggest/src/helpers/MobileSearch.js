/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import hooks from '@hsl-fi/hooks';
import cx from 'classnames';
import ReactModal from 'react-modal';
import Icon from '@digitransit-component/digitransit-component-icon';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
import Autosuggest from 'react-autosuggest';
import styles from './MobileSearch.scss';

class AutosuggestPatch extends Autosuggest {
  constructor(props) {
    super(props);
    const self = this;
    self.onSuggestionTouchMove = () => {
      self.justSelectedSuggestion = false;
      self.pressedSuggestion = null;
    };
  }
}

const MobileSearch = ({
  appElement,
  id,
  closeHandle,
  clearInput,
  value,
  suggestions,
  inputProps,
  fetchFunction,
  renderSuggestion,
  getSuggestionValue,
  ariaLabel,
  label,
  onSuggestionSelected,
  clearOldSearches,
  onKeyDown,
  dialogHeaderText,
  dialogPrimaryButtonText,
  dialogSecondaryButtonText,
  clearInputButtonText,
  focusInput,
  color,
  hoverColor,
  searchOpen,
}) => {
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const { lock, unlock } = hooks.useScrollLock();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const inputRef = React.useRef();

  const onOpen = useCallback(() => {
    lock();
  }, []);

  const handleClose = useCallback(() => {
    unlock();
    closeHandle();
  }, []);

  useEffect(() => {
    ReactModal.setAppElement(appElement);
  }, []);

  const onSelect = (e, ref) => {
    if (ref.suggestion.type === 'clear-search-history') {
      setDialogOpen(true);
    } else if (!ref.suggestion.properties.arrowClicked) {
      // Select item if fill input button is not pressed (diagonal arrow in suggestion items)
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

  const renderDialogModal = () => {
    return (
      <DialogModal
        appElement={appElement}
        isModalOpen={isDialogOpen}
        handleClose={() => setDialogOpen(false)}
        headerText={dialogHeaderText}
        primaryButtonText={dialogPrimaryButtonText}
        secondaryButtonText={dialogSecondaryButtonText}
        primaryButtonOnClick={() => {
          clearOldSearches();
          setDialogOpen(false);
        }}
        secondaryButtonOnClick={() => setDialogOpen(false)}
        color={color}
        hoverColor={hoverColor}
      />
    );
  };

  const clearButton = () => {
    return (
      <button
        type="button"
        className={styles['clear-input']}
        onClick={clearInput}
        aria-label={clearInputButtonText}
      >
        <Icon img="close" color={color} />
      </button>
    );
  };

  const renderContent = () => {
    return (
      <label className={styles['combobox-container']} htmlFor={inputId}>
        <div className={styles['combobox-icon']} onClick={handleClose}>
          <Icon img="arrow" />
        </div>
        <span className={styles['right-column']}>
          <span className={styles['combobox-label']} id={labelId}>
            {label}
          </span>
          <AutosuggestPatch
            alwaysRenderSuggestions
            id={id}
            suggestions={suggestions}
            onSuggestionsFetchRequested={fetchFunction}
            getSuggestionValue={getValue}
            renderSuggestion={renderItem}
            // focusInputOnSuggestionClick must be set to true.
            // If set to false, input won't be focused when user clicks on
            // Fill input button in suggestion list. (diagonal arrow in street name items)
            focusInputOnSuggestionClick
            shouldRenderSuggestions={() => true}
            inputProps={{
              ...inputProps,
              className: cx(
                `${styles.input} ${styles[id] || ''} ${
                  inputProps.value ? styles.hasValue : ''
                }`,
              ),
              autoFocus: true,
            }}
            renderInputComponent={p => (
              <>
                <input
                  aria-label={ariaLabel}
                  id={id}
                  onKeyDown={onKeyDown}
                  {...p}
                  style={{
                    '--color': `${color}`,
                    '--hover-color': `${hoverColor}`,
                  }}
                />
                {value && clearButton()}
              </>
            )}
            theme={styles}
            onSuggestionSelected={onSelect}
            ref={inputRef}
          />
        </span>
      </label>
    );
  };
  if (focusInput && inputRef.current?.input) {
    inputRef.current.input.focus();
  }

  return (
    <ReactModal
      isOpen={searchOpen}
      className={styles['mobile-modal']}
      overlayClassName={styles['mobile-modal-overlay']}
      onRequestClose={closeHandle}
      onAfterOpen={onOpen}
      onAfterClose={handleClose}
      shouldCloseOnEsc
    >
      <div className={styles['mobile-modal-content']}>
        {renderContent()}
        {renderDialogModal()}
      </div>
    </ReactModal>
  );
};

MobileSearch.propTypes = {
  appElement: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  closeHandle: PropTypes.func.isRequired,
  clearInput: PropTypes.func.isRequired,
  value: PropTypes.string,
  clearInputButtonText: PropTypes.string.isRequired,
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
  onKeyDown: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
  dialogHeaderText: PropTypes.string,
  dialogPrimaryButtonText: PropTypes.string,
  dialogSecondaryButtonText: PropTypes.string,
  focusInput: PropTypes.bool,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  searchOpen: PropTypes.bool.isRequired,
};

export default MobileSearch;
