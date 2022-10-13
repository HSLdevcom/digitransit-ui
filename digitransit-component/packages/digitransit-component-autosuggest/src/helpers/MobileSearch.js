import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@digitransit-component/digitransit-component-icon';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
import Autosuggest from 'react-autosuggest';
import mobileStyles from './MobileSearch.scss';
import mobileNoScrollStyles from './MobileNoScroll.scss';

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
  dialogHeaderText,
  dialogPrimaryButtonText,
  dialogSecondaryButtonText,
  clearInputButtonText,
  focusInput,
  color,
  hoverColor,
  accessiblePrimaryColor,
  searchOpen,
  fontWeights,
  showScroll,
}) => {
  const styles = showScroll ? mobileStyles : mobileNoScrollStyles;

  const inputId = `${id}-input`;
  const labelId = `${id}-label`;

  const [isDialogOpen, setDialogOpen] = useState(false);
  const inputRef = React.useRef();

  useEffect(() => {
    ReactModal.setAppElement(appElement);
  }, []);

  const onClose = useCallback(() => {
    closeHandle();
  });

  const onSelect = (e, ref) => {
    if (ref.suggestion.type === 'clear-search-history') {
      setDialogOpen(true);
    } else if (!ref.suggestion.properties.arrowClicked) {
      // Select item if fill input button is not pressed (diagonal arrow in suggestion items)
      onSuggestionSelected(e, ref);
    }
  };

  const isKeyboardSelectionEvent = event => {
    const space = [13, ' ', 'Spacebar'];
    const enter = [32, 'Enter'];
    const key = (event && (event.key || event.which || event.keyCode)) || '';

    if (!key || !space.concat(enter).includes(key)) {
      return false;
    }
    event.preventDefault();
    return true;
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
        <button type="button" className={styles['clear-search-history']}>
          {item.labelId}
        </button>
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
        fontWeights={fontWeights}
      />
    );
  };

  const clearButton = () => {
    return (
      <button
        type="button"
        className={styles['clear-input']}
        onClick={clearInput}
        onKeyDown={e => isKeyboardSelectionEvent(e) && clearInput()}
        aria-label={clearInputButtonText}
      >
        <Icon img="close" color={color} />
      </button>
    );
  };

  const renderContent = () => {
    return (
      <div className={styles['combobox-container']} htmlFor={inputId}>
        <button
          type="button"
          className={styles['combobox-icon']}
          onClick={() => onClose()}
          onKeyDown={e => isKeyboardSelectionEvent(e) && onClose()}
          aria-label={dialogSecondaryButtonText}
          tabIndex={0}
        >
          <Icon img="arrow" />
        </button>
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
                <input aria-label={ariaLabel} id={id} {...p} />
                {value && clearButton()}
              </>
            )}
            theme={styles}
            onSuggestionSelected={onSelect}
            ref={inputRef}
          />
        </span>
      </div>
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
      onAfterClose={onClose}
      shouldCloseOnEsc
    >
      <div
        className={styles['mobile-modal-content']}
        style={{
          '--color': `${color}`,
          '--accessible-primary-color': accessiblePrimaryColor,
          '--hover-color': `${hoverColor}`,
          '--font-weight-medium': fontWeights.medium,
        }}
      >
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
  ariaLabel: PropTypes.string,
  dialogHeaderText: PropTypes.string,
  dialogPrimaryButtonText: PropTypes.string,
  dialogSecondaryButtonText: PropTypes.string,
  focusInput: PropTypes.bool,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  accessiblePrimaryColor: PropTypes.string.isRequired,
  searchOpen: PropTypes.bool.isRequired,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number.isRequired,
  }).isRequired,
  showScroll: PropTypes.bool,
};

export default MobileSearch;
