import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
import Icon from '@digitransit-component/digitransit-component-icon';
import hooks from '@hsl-fi/hooks';
import { useTranslation } from 'react-i18next';
import { useCombobox } from 'downshift';
import mobileStyles from './MobileSearch.scss';
import mobileNoScrollStyles from './MobileNoScroll.scss';
import { Suggestions } from './Suggestions';
import { Input } from './Input';
import {
  isKeyboardSelectionEvent,
  getSuggestionValue,
  isPOISearch,
} from '../utils/utils';

/**
 * @typedef AutosuggestState
 * @property {array} suggestions
 * @property {boolean} renderMobile
 *
 * @typedef MobileViewProps
 * @property {string} appElement
 * @property {string} id
 * @property {string} placeholder
 * @property {function} clearInput
 * @property {function} onSelectedItemChange
 * @property {object} fontWeights
 * @property {function} clearOldSearches
 * @property {object} suggestionProps
 * @property {object} colors
 * @property {string} lng
 * @property {object} ariaProps
 * @property {string} value
 * @property {string} inputClassName
 * @property {boolean} required
 * @property {string} [mobileLabel]
 * @property {boolean} [showScroll]
 * @property {AutosuggestState} state
 * @property {function} dispatch
 *
 * @param {MobileViewProps} props
 * @returns {JSX.Element}
 */
const MobileView = ({
  appElement,
  id,
  placeholder,
  clearInput,
  onSelectedItemChange,
  fontWeights,
  clearOldSearches,
  suggestionProps,
  lng,
  ariaProps,
  value,
  inputClassName,
  required,
  mobileLabel,
  showScroll,
  state,
  dispatch,
  colors,
}) => {
  const [t] = useTranslation();
  const { lock, unlock } = hooks.useScrollLock();
  const styles = showScroll ? mobileStyles : mobileNoScrollStyles;
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const [isDialogOpen, setDialogOpen] = useState(false);
  const inputRef = React.useRef();

  useEffect(() => {
    ReactModal.setAppElement(appElement);
  }, []);

  useEffect(() => {
    if (state.renderMobile) {
      lock();
    } else {
      unlock();
    }
  }, [state.renderMobile]);

  /**
   * independent hooks in mobile view.
   * inputValue and suggestion states are kept in the parent
   */
  const {
    highlightedIndex,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getItemProps,
    setHighlightedIndex,
  } = useCombobox({
    items: state.suggestions,
    inputValue: value,
    isOpen: true,
    onSelectedItemChange: changes => {
      onSelectedItemChange(changes);
      dispatch({ type: 'TOGGLE_MENU', isMobile: true });
    },
    inputId,
    labelId,
    selectedItem: null,
    defaultHighlightedIndex: -1,
    onInputValueChange: ({ inputValue }) =>
      state.renderMobile && // prevent updating value when the search is not open
      dispatch({ type: 'INPUT_CHANGE', value: inputValue }),
    stateReducer: (oldState, { changes, type }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEscape: {
          setHighlightedIndex(-1);
          dispatch({ type: 'TOGGLE_MENU', isMobile: true });
          return oldState;
        }
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
          if (state.loading) {
            dispatch({ type: 'PENDING_ENTER', enterPending: true });
            return oldState;
          }
          // select the first item if none is highlighted
          if (oldState.highlightedIndex === -1) {
            return {
              ...changes,
              selectedItem: state.suggestions[0],
            };
          }
          return changes;
        // allows tabbing out of input field without closing
        case useCombobox.stateChangeTypes.InputBlur: {
          return oldState;
        }
        default:
          return changes;
      }
    },
    itemToString(suggestion) {
      return suggestion ? getSuggestionValue(suggestion) : '';
    },
  });
  // call to suppress ref errors from downshift
  getLabelProps({}, { suppressRefError: true });
  getMenuProps({}, { suppressRefError: true });
  getInputProps({}, { suppressRefError: true });
  getItemProps({ index: -1 }, { suppressRefError: true });

  const { ariaRequiredText, SearchBarId, ariaCurrentSuggestion } = ariaProps;
  const ariaLabel = ariaRequiredText
    .concat(' ')
    .concat(SearchBarId)
    .concat(' ')
    .concat(ariaCurrentSuggestion);
  return (
    <ReactModal
      isOpen={state.renderMobile}
      className={styles['mobile-modal']}
      overlayClassName={styles['mobile-modal-overlay']}
      shouldReturnFocusAfterClose={false}
      shouldCloseOnEsc
    >
      <div
        className={styles['mobile-modal-content']}
        style={{
          '--color': colors.primary,
          '--accessible-primary-color': colors.accessiblePrimary,
          '--hover-color': colors.hover,
          '--font-weight-medium': fontWeights.medium,
        }}
      >
        <div className={styles['combobox-container']} htmlFor={inputId}>
          <button
            type="button"
            className={styles['combobox-icon']}
            onClick={() => {
              setHighlightedIndex(-1);
              dispatch({ type: 'TOGGLE_MENU', isMobile: true });
            }}
            onKeyDown={e => {
              if (isKeyboardSelectionEvent(e)) {
                setHighlightedIndex(-1);
                dispatch({ type: 'TOGGLE_MENU', isMobile: true });
              }
            }}
            aria-label={t('cancel', { lng })}
            tabIndex={0}
          >
            <Icon img="arrow" />
          </button>
          <span className={styles['right-column']}>
            <span
              className={styles['combobox-label']}
              id={labelId}
              {...getLabelProps()}
            >
              {mobileLabel}
            </span>
            <Input
              placeholder={
                isPOISearch(id)
                  ? t('address-place-or-business', { lng })
                  : placeholder
              }
              id={id}
              lng={lng}
              value={value}
              getInputProps={getInputProps}
              getLabelProps={getLabelProps}
              clearInput={() => clearInput(inputRef)}
              ariaLabel={ariaLabel}
              inputRef={inputRef}
              styles={styles}
              renderLabel={false}
              clearButtonColor={colors.primary}
              autoFocus
              inputClassName={inputClassName}
              required={required}
              isMobile
            />
            <Suggestions
              suggestions={state.suggestions}
              getMenuProps={getMenuProps}
              getItemProps={getItemProps}
              highlightedIndex={highlightedIndex}
              isOpen // when mobile view is open we always want to show suggestions
              hidden={false}
              lng={lng}
              styles={styles}
              renderClearHistoryButton
              handleClearHistory={() => setDialogOpen(true)}
              {...suggestionProps}
            />
          </span>
        </div>
        <DialogModal
          appElement={appElement}
          isModalOpen={isDialogOpen}
          handleClose={() => setDialogOpen(false)}
          headerText={t('delete-old-searches-header', { lng })}
          primaryButtonText={t('delete', { lng })}
          secondaryButtonText={t('cancel', { lng })}
          primaryButtonOnClick={() => {
            clearOldSearches();
            setDialogOpen(false);
          }}
          secondaryButtonOnClick={() => setDialogOpen(false)}
          colors={colors}
          fontWeights={fontWeights}
          lang={lng}
        />
      </div>
    </ReactModal>
  );
};

MobileView.propTypes = {
  appElement: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  clearInput: PropTypes.func.isRequired,
  clearOldSearches: PropTypes.func.isRequired,
  onSelectedItemChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number.isRequired,
  }).isRequired,
  suggestionProps: PropTypes.shape({}).isRequired,
  ariaProps: PropTypes.shape({
    ariaRequiredText: PropTypes.string.isRequired,
    SearchBarId: PropTypes.string.isRequired,
    ariaCurrentSuggestion: PropTypes.string.isRequired,
  }).isRequired,
  inputClassName: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  mobileLabel: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  showScroll: PropTypes.bool.isRequired,
  lng: PropTypes.string.isRequired,
  state: PropTypes.shape({
    suggestions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    renderMobile: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default MobileView;
