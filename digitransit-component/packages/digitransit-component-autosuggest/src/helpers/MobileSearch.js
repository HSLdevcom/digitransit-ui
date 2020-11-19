/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import cx from 'classnames';
import Modal from 'react-modal';
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
}) => {
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;

  const [isDialogOpen, setDialogOpen] = useState(false);
  const inputRef = React.useRef();

  const onSelect = (e, ref) => {
    if (ref.suggestion.type === 'clear-search-history') {
      setDialogOpen(true);
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
        <Icon img="close" />
      </button>
    );
  };

  const renderContent = () => {
    return (
      <label className={styles['combobox-container']} htmlFor={inputId}>
        <div className={styles['combobox-icon']} onClick={closeHandle}>
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
            focusInputOnSuggestionClick={false}
            shouldRenderSuggestions={() => true}
            highlightFirstSuggestion
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
  if (id !== 'origin-stop-near-you' && id !== 'favourite') {
    return (
      <div className={styles['fullscreen-root']}>
        <Modal
          appElement={document ? document.querySelector(appElement) : undefined}
          isOpen
          className={styles['mobile-modal-content']}
          overlayClassName={styles['mobile-modal-overlay']}
        >
          {renderContent()}
        </Modal>
        {renderDialogModal()}
      </div>
    );
  }
  return (
    <div className={styles['fullscreen-root']}>
      {renderContent()}
      {renderDialogModal()}
    </div>
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
};

export default MobileSearch;
