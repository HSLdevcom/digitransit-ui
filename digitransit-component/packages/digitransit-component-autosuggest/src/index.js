/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React, { useEffect, useCallback, useRef, useReducer } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import cx from 'classnames';
import { executeSearch } from '@digitransit-search-util/digitransit-search-util-execute-search-immidiate';
import { useCombobox } from 'downshift';
import Icon from '@digitransit-component/digitransit-component-icon';
import i18n from './utils/i18n';
import styles from './components/styles.scss';
import { getSuggestionValue, suggestionAsAriaContent } from './utils/utils';
import MobileView from './components/MobileView';
import { Input } from './components/Input';
import { Suggestions } from './components/Suggestions';
import { searchReducer } from './utils/searchReducer';

const getAriaProps = ({
  id,
  ariaLabel,
  lng,
  t,
  isMobile,
  suggestions,
  value,
  required,
}) => {
  const ariaBarId = id.replace('searchfield-', '');
  const SearchBarId =
    ariaLabel || t(ariaBarId, { lng }).replace('searchfield-', '').concat('.'); // Full stop makes screen reader speech clearer.
  const ariaRequiredText = required ? `${t('required', { lng })}.` : '';
  const ariaLabelInstructions = isMobile
    ? t('search-autosuggest-label-instructions-mobile', { lng })
    : t('search-autosuggest-label-instructions-desktop', { lng });
  const movingToDestinationFieldText =
    id === 'origin'
      ? t('search-autosuggest-label-move-to-destination', { lng })
      : '';
  const ariaLabelText = ariaLabelInstructions
    .concat(' ')
    .concat(movingToDestinationFieldText);

  const ariaSuggestionLen = t('search-autosuggest-len', {
    count: suggestions.length,
    lng,
  });

  const ariaCurrentSuggestion =
    suggestionAsAriaContent({ suggestions, t, lng }) || value
      ? t('search-current-suggestion', {
          lng,
          selection:
            suggestionAsAriaContent({ suggestions, t, lng }).toLowerCase() ||
            value,
        })
      : '';

  return {
    SearchBarId,
    ariaRequiredText,
    ariaLabelText,
    ariaSuggestionLen,
    ariaCurrentSuggestion,
  };
};

const positions = [
  'Valittu sijainti',
  'Nykyinen sijaintisi',
  'Current position',
  'Selected location',
  'Vald position',
  'Använd min position',
  'Min position',
  'Käytä nykyistä sijaintia',
  'Use current location',
  'Your current location',
  'Wybrane miejsce',
];

/**
 * Takes the targets and modifies them based on ownPlaces and isLocationSearch
 * @param {object} props
 * @param {string[]} props.targets
 * @param {boolean} props.isLocationSearch
 * @param {boolean} props.isMobile
 * @param {boolean} props.ownPlaces
 * @param {string[]} props.sources
 * @returns {string[]} newTargets
 */
const getNewTargets = ({
  targets,
  isLocationSearch,
  isMobile,
  ownPlaces,
  sources,
}) => {
  const useAll = !targets?.length;
  let newTargets;
  if (ownPlaces) {
    newTargets = ['Locations'];
    if (useAll || targets.includes('Stops')) {
      newTargets.push('Stops');
    }
    if (useAll || targets.includes('Stations')) {
      newTargets.push('Stations');
    }
    if (useAll || targets.includes('VehicleRentalStations')) {
      newTargets.push('VehicleRentalStations');
    }
  } else if (!useAll) {
    newTargets = [...targets];
    // in desktop, favorites are accessed via sub search
    if (
      isLocationSearch &&
      !isMobile &&
      (!sources.length || sources.includes('Favourite'))
    ) {
      newTargets.push('SelectFromOwnLocations');
    }
  }
  return newTargets;
};

/**
 * @example
 * const searchContext = {
 *   isPeliasLocationAware: false // true / false does Let Pelias suggest based on current user location
 *   minimalRegexp: undefined // used for testing min. regexp. For example: new RegExp('.{2,}'),
 *   lineRegexp: undefined //  identify searches for route numbers/labels: bus | train | metro. For example: new RegExp(
 *    //   '(^[0-9]+[a-z]?$|^[yuleapinkrtdz]$|(^m[12]?b?$))',
 *    //  'i',
 *    //  ),
 *   URL_PELIAS: '' // url for pelias searches
 *   feedIDs: ['HSL', 'HSLLautta'] // FeedId's like  [HSL, HSLLautta]
 *   geocodingSources: ['oa','osm','nlsfi']  // sources for geocoding
 *   geocodingSearchParams; {}  // Searchparmas fro geocoding
 *   getFavouriteLocations: () => ({}),    // Function that returns array of favourite locations.
 *   getFavouriteStops: () => ({}),        // Function that returns array of favourite stops.
 *   getLanguage: () => ({}),              // Function that returns current language.
 *   getFavouriteRoutes: () => ({}),       // Function that returns array of favourite routes.
 *   getPositions: () => ({}),             // Function that returns user's geolocation.
 *   getRoutesQuery: () => ({}),           // Function that returns query for fetching routes.
 *   getStopAndStationsQuery: () => ({}),  // Function that fetches favourite stops and stations from graphql API.
 *   getFavouriteRoutesQuery: () => ({}),  // Function that returns query for fetching favourite routes.
 *   getFavouriteVehicleRentalStations: () => ({}),  // Function that returns favourite bike rental station.
 *   getFavouriteVehicleRentalStationsQuery: () => ({}), // Function that returns query for fetching favourite bike rental stations.
 *   startLocationWatch: () => ({}),       // Function that locates users geolocation.
 *   saveSearch: () => ({}),               // Function that saves search to old searches store.
 *   clearOldSearches: () => ({}),         // Function that clears old searches store.
 *   getFutureRoutes: () => ({}),          // Function that return future routes
 *   saveFutureRoute: () => ({}),          // Function that saves a future route
 *   clearFutureRoutes: () => ({}),        // Function that clears future routes
 * };
 * const lang = 'fi'; // en, fi or sv
 * const onSelect = (item, id) => {
 *    // Funtionality when user selects a suggesions. No default implementation is given.
 *    return null;
 * };
 * const onClear = id => {
 *    // Called  when user clicks the clear search string button. No default implementation.
 *    return null;
 * };
 * const getAutoSuggestIcons: {
 *   // Called for every city bike station rendered as a search suggestion. Should return the icon and
 *   // color used for that station. Two icons are available, 'citybike-stop-digitransit' anditybike-stop-digitransit-secondary'.
 *   citybikes: station => {
 *      return ['citybike-stop-digitransit', '#f2b62d'];
 *   }
 * }
 * const transportMode = undefined;
 * const placeholder = "stop-near-you";
 * const targets = ['Locations', 'Stops', 'Routes']; // Defines what you are searching. Options are Locations, Stops, Stations, Routes, VehicleRentalStations, FutureRoutes, MapPosition and CurrentPosition. Leave empty to search all targets.
 * const sources = ['Favourite', 'History', 'Datasource'] // Defines where you are searching. all available are: Favourite, History (previously searched searches) and Datasource. Leave empty to use all sources.
 * return (
 *  <DTAutosuggest
 *    appElement={appElement} // Required. Root element's id. Needed for react-modal component.
 *    searchContext={searchContext}
 *    icon="origin" // Optional String for icon that is shown left of searchfield. used with Icon library
 *    id="origin" // used for style props and info for component.
 *    placeholder={placeholder} // String that is showns initally in search field
 *    value="" // e.g. user typed string that is shown in search field
 *    onSelect={onSelect}
 *    onClear={onClear}
 *    lang={lang}
 *    getAutoSuggestIcons={getAutoSuggestIcons}
 *    transportMode={transportMode} // transportmode with which we filter the routes, e.g. route-BUS
 *    geocodingSize={10} // defines how many stops and stations to fetch from geocoding. Useful if you want to filter the results and still get a reasonable amount of suggestions.
 *    filterResults={results => return results} // Optional filtering function for routes and stops
 *    handelViaPoints={() => return null } // Optional Via point handling logic. This is currently managed with DTAutosuggestpanel by default, but if DTAutosuggest is used seperatelly own implementation must be provided.
 *    focusChange={() => return null} // When suggestion is selected, handle changing focus. This is currently managed with DTAutosuggestpanel by default, but if DTAutosuggest is used seperatelly own implementation must be provided.
 *    storeRef={() => return null} // Functionality to store refs. Currenlty managed with DTAutosuggestpanel by default, but if DTAutosuggest is used seperatelly own implementation must be provided.
 *    sources={sources}
 *    targets={targets}
 *    isMobile  // Optional. Defaults to false. Whether to use mobile search.
 *    mobileLabel="Custom label" // Optional. Custom label text for autosuggest field on mobile.
 *    inputClassName="" // Optional. Custom classname applied to the input element of the component for providing CSS styles.
 *    translatedPlaceholder= // Optional. Custon translated placeholder text for autosuggest field.
 *
 * @typedef DTAutosuggestProps
 * @property {string} appElement
 * @property {string} id
 * @property {string} placeholder
 * @property {function} onSelect
 * @property {string} [icon]
 * @property {string} [value]
 * @property {function} [onClear]
 * @property {string} [lang]
 * @property {Object} [getAutoSuggestIcons]
 * @property {function} [handleViaPoints]
 * @property {function} [focusChange]
 * @property {function} [storeRef]
 * @property {boolean} [isMobile]
 * @property {string} [mobileLabel]
 * @property {string} [inputClassName]
 * @property {string} [translatedPlaceholder]
 * @property {boolean} [required]
 * @property {string} [color]
 * @property {string} [hoverColor]
 * @property {string} [accessiblePrimaryColor]
 * @property {Object} [fontWeights]
 * @property {Object} [modeIconColors]
 * @property {string} [modeSet]
 * @property {boolean} [showScroll]
 * @property {boolean} [isEmbedded]
 * Geocoding related props
 * @property {Object} searchContext
 * @property {string} [transportMode]
 * @property {string[]} [targets]
 * @property {string[]} [sources]
 * @property {number} [geocodingSize]
 * @property {function} [filterResults]
 * @property {Object} [pathOpts]
 * @property {Object} [refPoint]
 * @param {DTAutosuggestProps} props
 * @returns {JSX.Element}
 */
function DTAutosuggest({
  appElement,
  id,
  placeholder,
  onSelect,
  icon,
  value,
  onClear,
  lang: lng,
  getAutoSuggestIcons,
  handleViaPoints,
  focusChange,
  storeRef,
  isMobile,
  mobileLabel,
  inputClassName,
  translatedPlaceholder,
  required,
  color,
  hoverColor,
  ariaLabel,
  accessiblePrimaryColor,
  fontWeights,
  modeIconColors,
  modeSet,
  showScroll,
  isEmbedded,
  transportMode,
  targets,
  sources,
  geocodingSize,
  filterResults,
  searchContext,
  pathOpts,
  refPoint,
}) {
  const [t] = useTranslation();
  const initialState = {
    suggestions: [],
    loading: false,
    sources,
    showOwnPlaces: false,
    pendingSelection: null,
    isCleared: false,
    renderMobile: false,
    value,
    enterPending: false,
    isMenuOpen: false,
  };
  const [state, dispatch] = useReducer(searchReducer, initialState);
  // Reset the state when value prop changes
  useEffect(() => dispatch({ type: 'RESET', initialState }), [value]);
  // create and store input ref in the parent if storeRef is provided
  const inputRef = useRef(id);
  useEffect(() => {
    if (storeRef) {
      storeRef(inputRef.current);
    }
  }, [inputRef.current]);

  const fetchSuggestions = useCallback(() => {
    const useAll = !targets?.length;
    const isLocationSearch = useAll || targets.includes('Locations');

    const newTargets = getNewTargets({
      targets,
      isLocationSearch,
      isMobile,
      ownPlaces: state.showOwnPlaces,
      sources: state.sources,
    });
    // remove  location favourites in desktop search (collection item replaces it in target array)
    const newSources = state.sources
      ? state.sources.filter(
          s =>
            !isLocationSearch ||
            !s === 'Favourite' ||
            state.showOwnPlaces ||
            isMobile,
        )
      : state.sources;
    executeSearch(
      newTargets,
      newSources,
      transportMode,
      searchContext,
      filterResults,
      geocodingSize,
      {
        input: state.value || '',
      },
      searchResult => {
        if (searchResult == null) {
          dispatch({
            type: 'FETCH_SUGGESTIONS',
            loading: true,
          });
          return;
        }

        const newSuggestions = (searchResult.results || [])
          .filter(
            suggestion =>
              suggestion.type !== 'FutureRoute' ||
              (suggestion.type === 'FutureRoute' &&
                suggestion.properties.time > Date.now() / 1000),
          )
          .map(suggestion => {
            if (
              suggestion.type === 'CurrentLocation' ||
              suggestion.type === 'SelectFromMap' ||
              suggestion.type === 'SelectFromOwnLocations' ||
              suggestion.type === 'back'
            ) {
              const translatedSuggestion = { ...suggestion };
              translatedSuggestion.properties.labelId = t(
                suggestion.properties.labelId,
                { lng },
              );
              return translatedSuggestion;
            }
            return suggestion;
          });
        dispatch({
          type: 'FETCH_SUGGESTIONS',
          loading: false,
          suggestions: newSuggestions,
        });
      },
      pathOpts,
      refPoint,
    );
  }, [
    state.value,
    state.sources,
    state.showOwnPlaces,
    targets,
    transportMode,
    searchContext,
    filterResults,
    geocodingSize,
    isMobile,
    lng,
    pathOpts,
    refPoint,
    id,
  ]);

  const selectSuggestion = useCallback(
    (suggestion, index) => {
      if (!suggestion) {
        return;
      }
      if (handleViaPoints) {
        handleViaPoints(suggestion, index);
      } else {
        onSelect(suggestion, id);
      }
      if (focusChange && (!isMobile || isEmbedded)) {
        focusChange();
      }
      if (inputRef.current) {
        inputRef.current.blur();
      }
    },
    [isMobile],
  );

  const onSelectedItemChange = changes =>
    selectSuggestion(changes.selectedItem, changes.highlightedIndex);

  const {
    isOpen,
    highlightedIndex,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getItemProps,
    selectItem,
    openMenu,
    closeMenu,
  } = useCombobox({
    inputId: id,
    inputValue: state.value,
    defaultHighlightedIndex: 0,
    onInputValueChange: ({ inputValue }) =>
      dispatch({ type: 'INPUT_CHANGE', value: inputValue }),
    stateReducer: useCallback(
      (oldState, { type, changes }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.ItemClick:
          case useCombobox.stateChangeTypes.InputKeyDownEnter: {
            // setCleared(false);
            // keep enterPressedRef to make selection when suggestions have loaded
            if (state.loading) {
              dispatch({ type: 'PENDING_ENTER', enterPending: true });
              return oldState;
            }
            if (!changes.selectedItem) {
              return changes;
            }
            if (changes.selectedItem.type === 'SelectFromOwnLocations') {
              // if selecting from own locations, keep menu open and keep old state
              dispatch({
                type: 'SET_SOURCES',
                sources: ['Favourite', 'Back'],
                showOwnPlaces: true,
                pendingSelection: changes.selectedItem.type,
              });
              return oldState;
            }
            if (changes.selectedItem.type === 'back') {
              dispatch({
                type: 'SET_SOURCES',
                sources,
                showOwnPlaces: false,
                pendingSelection: null,
              });
              return oldState;
            }
            return changes;
          }
          case useCombobox.stateChangeTypes.InputClick: {
            // clear input if current position or selected location is shown
            if (positions.includes(value)) {
              return { ...changes, inputValue: '', isOpen: true };
            }
            return {
              ...changes,
              isOpen: true,
            };
          }
          case useCombobox.stateChangeTypes.InputBlur: {
            if (changes.selectedItem) {
              return {
                ...changes,
                selectedItem: oldState.selectItem,
                inputValue: oldState.inputValue,
              };
            }
            return changes;
          }
          case useCombobox.stateChangeTypes.InputKeyDownEscape: {
            return {
              ...changes,
              inputValue: '',
            };
          }
          default: {
            return changes;
          }
        }
      },
      [state.loading, value, isMobile],
    ),
    items: state.suggestions,
    itemToString(suggestion) {
      return suggestion ? getSuggestionValue(suggestion) : '';
    },
    onSelectedItemChange,
    onIsOpenChange: changes => {
      if (changes.isOpen && !state.renderMobile) {
        dispatch({ type: 'TOGGLE_MENU', isMobile });
      }
    },
  });
  const inputOnBlur = () => {
    dispatch({
      isMobile,
      value: !isMobile && value,
      type: 'INPUT_BLUR',
    });
    if (!isMobile) {
      dispatch({
        type: 'RESET',
        initialState,
      });
    }
  };

  const clearInput = ref => {
    dispatch({ type: 'CLEAR' });
    if (onClear) {
      onClear(id);
    }
    if (ref.current) {
      ref.current.focus();
    }
    openMenu();
  };

  // Fetch suggestions when isOpen, value, or fetchSuggestions dependies change
  useEffect(() => {
    if (isOpen || state.renderMobile) {
      fetchSuggestions(state.value);
    }
  }, [isOpen, state.renderMobile, state.value, fetchSuggestions]);

  // this effect handles selecting the suggestion when enter was pressed but suggestions were still loading
  useEffect(() => {
    if (state.enterPending && !state.loading) {
      selectSuggestion(state.suggestions[0], 0);
      closeMenu();
    }
  }, [state.loading, state.pendingEnter, state.suggestions]);

  const baseItemProps = {
    loading: state.loading,
    isMobile,
    ariaFavouriteString: t('favourite', { lng }),
    color,
    accessiblePrimaryColor,
    fontWeights,
    getAutoSuggestIcons,
    modeIconColors,
    modeSet,
  };

  const {
    ariaCurrentSuggestion,
    ariaRequiredText,
    SearchBarId,
    ariaLabelText,
  } = getAriaProps({
    id,
    lng,
    t,
    isMobile,
    ariaLabel,
    suggestions: state.suggestions,
    value: state.value,
    required,
  });

  const mobileClearOldSearches = () => {
    const { context, clearOldSearches, clearFutureRoutes } = searchContext;
    if (context && clearOldSearches) {
      clearOldSearches(context);
      if (clearFutureRoutes) {
        clearFutureRoutes(context);
      }
      fetchSuggestions(state.value);
    }
  };

  useEffect(() => {
    if (!state.renderMobile && !isOpen) {
      dispatch({ type: 'RESET', initialState });
    }
  }, [state.renderMobile, isOpen]);

  return (
    <>
      {isMobile && (
        <MobileView
          placeholder={t(placeholder, { lng })}
          fontWeights={fontWeights}
          clearOldSearches={mobileClearOldSearches}
          appElement={appElement}
          mobileLabel={mobileLabel || t(id, { lng })}
          ariaProps={{
            ariaCurrentSuggestion,
            SearchBarId,
            ariaRequiredText,
          }}
          id={id}
          lng={lng}
          onSelectedItemChange={onSelectedItemChange}
          value={state.value}
          clearInput={clearInput}
          itemProps={baseItemProps}
          showScroll={!!showScroll}
          color={color}
          hoverColor={hoverColor}
          clearButtonColor={color}
          accessiblePrimaryColor={accessiblePrimaryColor}
          inputClassName={inputClassName}
          required={required}
          state={state}
          dispatch={dispatch}
        />
      )}

      <div
        className={cx([
          styles['autosuggest-input-container'],
          styles[id],
          state.renderMobile && 'hidden',
        ])}
        style={{
          '--color': color,
          '--hover-color': hoverColor,
        }}
      >
        {icon && (
          <div
            className={cx([
              styles['autosuggest-input-icon'],
              styles[id],
              inputClassName && styles[`${inputClassName}-input-icon`],
            ])}
            aria-label={ariaRequiredText
              .concat(' ')
              .concat(SearchBarId)
              .concat(' ')
              .concat(t('search-autosuggest-label', { lng }))}
          >
            <Icon img={`${icon}`} />
          </div>
        )}
        <Input
          inputClassName={inputClassName}
          ariaLabel={ariaCurrentSuggestion
            .concat(' ')
            .concat(ariaRequiredText)
            .concat(' ')
            .concat(SearchBarId)
            .concat(' ')
            .concat(ariaLabelText)}
          id={id}
          lng={lng}
          getInputProps={getInputProps}
          getLabelProps={getLabelProps}
          selectItem={selectItem}
          value={state.value}
          clearInput={clearInput}
          inputRef={inputRef}
          styles={styles}
          clearButtonColor={color}
          placeholder={translatedPlaceholder || t(placeholder, { lng })}
          required={required}
          transportMode={transportMode}
          isMobile={isMobile}
          inputOnBlur={inputOnBlur}
        />

        <Suggestions
          hidden={!isOpen || isMobile}
          highlightedIndex={highlightedIndex}
          getItemProps={getItemProps}
          getMenuProps={getMenuProps}
          suggestions={state.suggestions}
          itemProps={baseItemProps}
          lng={lng}
          styles={styles}
        />
      </div>
    </>
  );
}

DTAutosuggest.propTypes = {
  appElement: PropTypes.string.isRequired,
  icon: PropTypes.string,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  translatedPlaceholder: PropTypes.string,
  value: PropTypes.string,
  transportMode: PropTypes.string,
  geocodingSize: PropTypes.number,
  filterResults: PropTypes.func,
  searchContext: PropTypes.shape({
    URL_PELIAS: PropTypes.string,
    // eslint-disable-next-line
    context: PropTypes.object,
    clearOldSearches: PropTypes.func,
    clearFutureRoutes: PropTypes.func,
  }).isRequired,
  sources: PropTypes.arrayOf(PropTypes.string),
  targets: PropTypes.arrayOf(PropTypes.string),
  ariaLabel: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  storeRef: PropTypes.func,
  handleViaPoints: PropTypes.func,
  focusChange: PropTypes.func,
  lang: PropTypes.string,
  isMobile: PropTypes.bool,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  accessiblePrimaryColor: PropTypes.string,
  pathOpts: PropTypes.shape({
    routesPrefix: PropTypes.string,
    stopsPrefix: PropTypes.string,
  }),
  mobileLabel: PropTypes.string,
  refPoint: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  inputClassName: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
  modeIconColors: PropTypes.objectOf(PropTypes.string),
  getAutoSuggestIcons: PropTypes.objectOf(PropTypes.func),
  required: PropTypes.bool,
  modeSet: PropTypes.string,
  showScroll: PropTypes.bool,
  isEmbedded: PropTypes.bool,
};

DTAutosuggest.defaultProps = {
  icon: undefined,
  value: '',
  transportMode: undefined,
  filterResults: undefined,
  onClear: undefined,
  lang: 'fi',
  storeRef: undefined,
  handleViaPoints: undefined,
  focusChange: undefined,
  getAutoSuggestIcons: undefined,
  sources: [],
  targets: undefined,
  isMobile: false,
  isEmbedded: false,
  geocodingSize: undefined,
  color: '#007ac9',
  hoverColor: '#0062a1',
  accessiblePrimaryColor: '#0074be',
  pathOpts: {
    routesPrefix: 'linjat',
    stopsPrefix: 'pysakit',
  },
  ariaLabel: undefined,
  mobileLabel: undefined,
  inputClassName: '',
  translatedPlaceholder: undefined,
  fontWeights: {
    medium: 500,
  },
  modeIconColors: undefined,
  required: false,
  modeSet: undefined,
  showScroll: false,
  refPoint: {},
};

export default props => {
  return (
    <I18nextProvider i18n={i18n}>
      <DTAutosuggest {...props} />
    </I18nextProvider>
  );
};
