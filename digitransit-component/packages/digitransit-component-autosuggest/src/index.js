/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import i18next from 'i18next';
import cx from 'classnames';
import Autosuggest from 'react-autosuggest';
import { executeSearch } from '@digitransit-search-util/digitransit-search-util-execute-search-immidiate';
import SuggestionItem from '@digitransit-component/digitransit-component-suggestion-item';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import { getNameLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import getLabel from '@digitransit-search-util/digitransit-search-util-get-label';
import Icon from '@digitransit-component/digitransit-component-icon';
import moment from 'moment-timezone';
import translations from './helpers/translations';
import styles from './helpers/styles.scss';
import MobileSearch from './helpers/MobileSearch';

moment.tz.setDefault('Europe/Helsinki');

i18next.init({ lng: 'fi', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

const Loading = props => (
  <div className={styles['spinner-loader']}>
    {(props && props.children) || (
      <span className={styles['sr-only']}>{i18next.t('loading')}</span>
    )}
  </div>
);

Loading.propTypes = {
  children: PropTypes.node,
};

function suggestionToAriaContent(item) {
  if (item.type !== 'FutureRoute') {
    let iconstr;
    if (item.properties.mode) {
      iconstr = `icon-icon_${item.mode}`;
    } else {
      const layer = item.properties.layer.replace('route-', '').toLowerCase();
      iconstr = i18next.t(layer);
    }
    const [name, label] = getNameLabel(item.properties, true);
    return [iconstr, name, label];
  } else {
    return [
      i18next.t('future-route'),
      `${i18next.t('origin')} ${item.properties.origin.name}, ${
        item.properties.origin.locality
      }, ${i18next.t('destination')} ${item.properties.destination.name}, ${
        item.properties.destination.locality
      }`,
      item.translatedText,
    ];
  }
}

function translateFutureRouteSuggestionTime(item) {
  moment.locale(i18next.language);

  const time = moment.unix(item.properties.time);
  let str = item.properties.arriveBy
    ? i18next.t('arrival')
    : i18next.t('departure');
  if (time.isSame(moment(), 'day')) {
    str = `${str} ${i18next.t('today')}`;
  } else if (time.isSame(moment().add(1, 'day'), 'day')) {
    str = `${str} ${i18next.t('tomorrow')}`;
  } else {
    str = `${str} ${time.format('dd D.M.')}`;
  }
  str = `${str} ${moment(time).format('HH:mm')}`;
  return str;
}
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
 *   getStoredFavouriteRoutes: () => ({}), // Function that returns array of favourite routes.
 *   getPositions: () => ({}),             // Function that returns user's geolocation.
 *   getRoutes: () => ({}),                // Function that fetches routes from graphql API.
 *   getStopAndStationsQuery: () => ({}),       // Function that fetches favourite stops and stations from graphql API.
 *   getFavouriteRoutes: () => ({}),       // Function that fetches favourite routes from graphql API.
 *   startLocationWatch: () => ({}),       // Function that locates users geolocation.
 *   saveSearch: () => ({}),               // Function that saves search to old searches store.
 *   clearOldSearches: () => ({}),            // Function that clears old searches store.
 * };
 * const lang = 'fi'; // en, fi or sv
 * const onSelect = () => {
 *    // Funtionality when user selects a suggesions. No default implementation is given.
 *    return null;
 * };
 * const onClear = () => {
 *    // Called  when user clicks the clear search string button. No default implementation.
 *    return null;
 * };
 * const placeholder = "stop-near-you";
 * const targets = ['Locations', 'Stops', 'Routes']; // Defines what you are searching. all available options are Locations, Stops, Routes, MapPosition and CurrentPosition. Leave empty to search all targets.
 * const sources = ['Favourite', 'History', 'Datasource'] // Defines where you are searching. all available are: Favourite, History (previously searched searches) and Datasource. Leave empty to use all sources.
 * return (
 *  <DTAutosuggest
 *    searchContext={searchContext}
 *    icon="origin" // Optional String for icon that is shown left of searchfield. used with Icon library
 *    id="origin" // used for style props and info for component.
 *    placeholder={placeholder} // String that is showns initally in search field
 *    value="" // e.g. user typed string that is shown in search field
 *    onSelect={onSelect}
 *    onClear={onClear}
 *    autoFocus={false} // defines that should this field be automatically focused when page is loaded.
 *    lang={lang}
 *    handelViaPoints={() => return null } // Optional Via point handling logic. This is currently managed with DTAutosuggestpanel by default, but if DTAutosuggest is used seperatelly own implementation must be provided.
 *    focusChange={() => return null} // When suggestion is selected, handle changing focus. This is currently managed with DTAutosuggestpanel by default, but if DTAutosuggest is used seperatelly own implementation must be provided.
 *    storeRef={() => return null} // Functionality to store refs. Currenlty managed with DTAutosuggestpanel by default, but if DTAutosuggest is used seperatelly own implementation must be provided.
 *    sources={sources}
 *    targets={targets}
 *    isMobile  // Optional. Defaults to false. Whether to use mobile search.
 */
class DTAutosuggest extends React.Component {
  static propTypes = {
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    icon: PropTypes.string,
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string,
    searchContext: PropTypes.any.isRequired,
    ariaLabel: PropTypes.string,
    onSelect: PropTypes.func,
    transportMode: PropTypes.string,
    filterSearchResultsByMode: PropTypes.func,
    onClear: PropTypes.func,
    isPreferredRouteSearch: PropTypes.bool,
    storeRef: PropTypes.func,
    handleViaPoints: PropTypes.func,
    focusChange: PropTypes.func,
    lang: PropTypes.string,
    sources: PropTypes.arrayOf(PropTypes.string),
    targets: PropTypes.arrayOf(PropTypes.string),
    isMobile: PropTypes.bool,
  };

  static defaultProps = {
    autoFocus: false,
    className: '',
    icon: undefined,
    value: '',
    transportMode: undefined,
    isPreferredRouteSearch: false,
    lang: 'fi',
    sources: [],
    targets: [],
    isMobile: false,
  };

  constructor(props) {
    super(props);
    i18next.changeLanguage(props.lang);
    this.state = {
      value: props.value,
      suggestions: [],
      editing: false,
      valid: true,
      pendingCurrentLocation: false,
      renderMobileSearch: false,
      sources: props.sources,
      targets: props.targets,
      typingTimer: null,
      typing: false,
      pendingSelection: null,
    };
  }

  componentDidUpdate = prevProps => {
    if (prevProps.lang !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps = nextProps => {
    // wait until address is set or geolocationing fails
    if (nextProps.value !== this.state.value && !this.state.editing) {
      this.setState({
        value: nextProps.value,
      });
    }
  };

  onChange = (event, { newValue, method }) => {
    const newState = {
      value: newValue,
    };
    if (!this.state.editing) {
      newState.editing = true;
      this.setState(newState, () => this.fetchFunction({ value: newValue }));
    } else if (method !== 'enter' || this.state.valid) {
      // test above drops unnecessary update
      // when user hits enter but search is unfinished
      if (this.state.typingTimer) {
        clearTimeout(this.state.typingTimer);
      }
      if (method === 'type') {
        // after timeout runs, aria alert will announce current selection
        const timer = setTimeout(() => {
          this.setState({ typing: false });
        }, 1000);
        newState.typingTimer = timer;
        newState.typing = true;
      }
      this.setState(newState);
    }
  };

  onBlur = () => {
    this.setState({
      editing: false,
      value: this.props.value,
    });
  };

  onSelected = (e, ref) => {
    if (this.state.valid) {
      if (ref.suggestion.type === 'SelectFromOwnLocations') {
        this.setState(
          {
            sources: ['Favourite', 'Back'],
            targets: ['Locations'],
            pendingSelection: ref.suggestion.type,
            value: '',
          },
          () => {
            this.fetchFunction({ value: '' });
          },
        );
        return;
      }
      if (ref.suggestion.type === 'back') {
        this.setState(
          {
            sources: this.props.sources,
            targets: this.props.targets,
            pendingSelection: ref.suggestion.type,
          },
          () => {
            this.fetchFunction({ value: '' });
          },
        );
        return;
      }
      if (this.props.handleViaPoints) {
        this.props.handleViaPoints(
          suggestionToLocation(ref.suggestion),
          ref.suggestionIndex,
        );
        this.setState({
          renderMobileSearch: false,
          suggestions: [],
        });
      }
      this.setState(
        {
          editing: false,
          value: ref.suggestionValue,
        },
        () => {
          this.input.blur();
          if (!this.props.handleViaPoints) {
            this.props.onSelect(ref.suggestion, this.props.id);
            this.setState({
              renderMobileSearch: false,
              sources: this.props.sources,
              targets: this.props.targets,
              suggestions: [],
            });
          }
          if (this.props.focusChange && !this.props.isMobile) {
            this.props.focusChange();
          }
        },
      );
    } else {
      this.setState(
        prevState => ({
          pendingSelection: prevState.value,
        }),
        () => this.checkPendingSelection(), // search may finish during state change
      );
    }
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
      sources: this.props.sources,
      targets: this.props.targets,
      editing: false,
    });
  };

  getSuggestionValue = suggestion => {
    if (
      suggestion.type === 'SelectFromOwnLocations' ||
      suggestion.type === 'back'
    ) {
      return '';
    }
    const value = getLabel(suggestion.properties);
    return value;
  };

  checkPendingSelection = () => {
    if (
      (this.state.pendingSelection === 'SelectFromOwnLocations' ||
        this.state.pendingSelection === 'back') &&
      this.state.valid
    ) {
      this.setState(
        {
          pendingSelection: null,
          editing: true,
        },
        () => {
          this.input.focus();
        },
      );
      // accept after all ongoing searches have finished
    } else if (this.state.pendingSelection && this.state.valid) {
      // finish the selection by picking first = best match
      this.setState(
        {
          pendingSelection: null,
          editing: false,
        },
        () => {
          if (this.state.suggestions.length) {
            this.input.blur();
            this.props.onSelect(this.state.suggestions[0], this.props.id);
          }
        },
      );
    }
  };

  clearButton = () => {
    return (
      <button
        type="button"
        className={styles['clear-input']}
        onClick={this.clearInput}
        aria-label={i18next.t('clear-button-label')}
      >
        <Icon img="close" />
      </button>
    );
  };

  fetchFunction = ({ value }) =>
    this.setState({ valid: false }, () => {
      executeSearch(
        this.state.targets,
        this.state.sources,
        this.props.transportMode,
        this.props.searchContext,
        this.props.filterSearchResultsByMode,
        {
          input: value,
        },
        searchResult => {
          if (searchResult == null) {
            return;
          }
          // XXX translates current location
          const suggestions = (searchResult.results || [])
            .filter(suggestion => {
              return (
                suggestion.type !== 'FutureRoute' ||
                (suggestion.type === 'FutureRoute' &&
                  suggestion.properties.time > moment().unix())
              );
            })
            .map(suggestion => {
              if (
                suggestion.type === 'CurrentLocation' ||
                suggestion.type === 'SelectFromMap' ||
                suggestion.type === 'SelectFromOwnLocations' ||
                suggestion.type === 'back'
              ) {
                const translated = { ...suggestion };
                translated.properties.labelId = i18next.t(
                  suggestion.properties.labelId,
                );
                return translated;
              }
              return suggestion;
            });
          if (
            value === this.state.value ||
            value === this.state.pendingSelection ||
            this.state.pendingSelection === 'SelectFromOwnLocations' ||
            this.state.pendingSelection === 'back'
          ) {
            this.setState(
              {
                valid: true,
                suggestions,
              },
              () => this.checkPendingSelection(),
            );
          }
        },
      );
    });

  clearInput = () => {
    const newState = {
      editing: true,
      value: '',
    };
    // must update suggestions
    this.setState(newState, () => this.fetchFunction({ value: '' }));
    if (this.props.onClear) {
      this.props.onClear();
    }
    this.input.focus();
  };

  inputClicked = inputValue => {
    if (!this.state.editing) {
      const newState = {
        editing: true,
        // reset at start, just in case we missed something
        pendingSelection: null,
      };
      // DT-3263: added stateKeyDown
      const stateKeyDown = {
        editing: true,
        pendingSelection: null,
        value: inputValue,
      };

      if (!this.state.suggestions.length) {
        // DT-3263: added if-else statement
        if (typeof inputValue === 'object' || !inputValue) {
          this.setState(newState, () =>
            this.fetchFunction({ value: this.state.value }),
          );
        } else {
          this.setState(stateKeyDown, () =>
            this.fetchFunction({ value: inputValue }),
          );
        }
      } else {
        this.fetchFunction({ value: this.state.value });
        this.setState(newState);
      }
    }
  };

  storeInputReference = autosuggest => {
    if (autosuggest !== null) {
      this.input = autosuggest.input;
      if (this.props.storeRef) {
        this.props.storeRef(autosuggest.input);
      }
    }
  };

  renderItem = item => {
    const newItem = {
      ...item,
      translatedText: translateFutureRouteSuggestionTime(item),
    };
    const ariaContent = suggestionToAriaContent(
      item.type === 'FutureRoute' ? newItem : item,
    );
    return (
      <SuggestionItem
        item={item.type === 'FutureRoute' ? newItem : item}
        ariaContent={ariaContent}
        loading={!this.state.valid}
        isMobile={this.props.isMobile}
      />
    );
  };

  // DT-3263 starts
  // eslint-disable-next-line consistent-return
  keyDown = event => {
    const keyCode = event.keyCode || event.which;
    if (this.state.editing) {
      return this.inputClicked();
    }

    if ((keyCode === 13 || keyCode === 40) && this.state.value === '') {
      return this.clearInput();
    }

    if (keyCode === 40 && this.state.value !== '') {
      const newState = {
        editing: true,
        value: this.state.value,
      };
      // must update suggestions
      this.setState(newState, () =>
        this.fetchFunction({ value: this.state.value }),
      );
    }
    if (!this.state.editing) {
      this.setState({ editing: true });
    }
  };

  suggestionAsAriaContent = () => {
    let label = [];
    if (this.state.suggestions[0]) {
      label = suggestionToAriaContent(this.state.suggestions[0]);
    }
    return label ? label.join(' - ') : '';
  };

  clearOldSearches = () => {
    const {
      context,
      clearOldSearches,
      clearFutureRoutes,
    } = this.props.searchContext;
    if (context && clearOldSearches) {
      clearOldSearches(context);
      if (clearFutureRoutes) {
        clearFutureRoutes(context);
      }
      this.fetchFunction({ value: this.state.value });
    }
  };

  render() {
    if (this.state.pendingCurrentLocation) {
      return <Loading />;
    }
    const { value, suggestions, renderMobileSearch } = this.state;
    const inputProps = {
      placeholder: i18next.t(this.props.placeholder),
      value,
      onChange: this.onChange,
      onBlur: this.onBlur,
      onFocus: () => this.setState({ renderMobileSearch: this.props.isMobile }),
      className: cx(
        `${styles.input} ${
          this.props.isMobile && this.props.transportMode ? styles.thin : ''
        } ${styles[this.props.id] || ''} ${
          this.state.value ? styles.hasValue : ''
        }`,
      ),
      onKeyDown: this.keyDown, // DT-3263
    };
    const ariaBarId = this.props.id.replace('searchfield-', '');
    let SearchBarId = this.props.ariaLabel || i18next.t(ariaBarId);
    SearchBarId = SearchBarId.replace('searchfield-', '');
    const ariaLabelText = i18next.t('search-autosuggest-label');
    const ariaSuggestionLen = i18next.t('search-autosuggest-len', {
      count: suggestions.length,
    });

    const ariaCurrentSuggestion = i18next.t('search-current-suggestion', {
      selection: this.suggestionAsAriaContent(),
    });
    return (
      <React.Fragment>
        <span className={styles['sr-only']} role="alert">
          {ariaSuggestionLen}
        </span>
        <span
          className={styles['sr-only']}
          role={this.state.typing ? undefined : 'alert'}
          aria-hidden={!this.state.editing || suggestions.length === 0}
        >
          {ariaCurrentSuggestion}
        </span>
        {renderMobileSearch && (
          <MobileSearch
            clearOldSearches={this.clearOldSearches}
            id={this.props.id}
            suggestions={[
              ...suggestions,
              {
                type: 'clear-search-history',
                labelId: i18next.t('clear-search-history'),
              },
            ]}
            inputProps={{
              ...inputProps,
              onBlur: () => null,
            }}
            fetchFunction={this.fetchFunction}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderItem}
            closeHandle={() =>
              this.setState(
                {
                  renderMobileSearch: false,
                  value: this.props.value,
                },
                () => this.onSuggestionsClearRequested(),
              )
            }
            ariaLabel={SearchBarId.concat(' ').concat(ariaLabelText)}
            label={i18next.t(this.props.id)}
            onSuggestionSelected={this.onSelected}
            onKeyDown={this.keyDown}
            dialogHeaderText={i18next.t('delete-old-searches-header')}
            dialogPrimaryButtonText={i18next.t('delete')}
            dialogSecondaryButtonText={i18next.t('cancel')}
          />
        )}
        {!renderMobileSearch && (
          <div
            className={cx([
              styles['autosuggest-input-container'],
              styles[this.props.id],
            ])}
          >
            {this.props.icon && (
              <div
                className={cx([
                  styles['autosuggest-input-icon'],
                  styles[this.props.id],
                ])}
              >
                <Icon img={`${this.props.icon}`} />
              </div>
            )}
            <Autosuggest
              alwaysRenderSuggestions={this.state.editing}
              id={this.props.id}
              suggestions={suggestions}
              onSuggestionsFetchRequested={this.fetchFunction}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={this.getSuggestionValue}
              renderSuggestion={this.renderItem}
              inputProps={inputProps}
              focusInputOnSuggestionClick
              shouldRenderSuggestions={() => this.state.editing}
              highlightFirstSuggestion
              theme={styles}
              renderInputComponent={p => (
                <>
                  <input
                    aria-label={SearchBarId.concat(' ').concat(ariaLabelText)}
                    id={this.props.id}
                    onClick={this.inputClicked}
                    onKeyDown={this.keyDown}
                    {...p}
                  />
                  {this.state.value && this.clearButton()}
                </>
              )}
              onSuggestionSelected={this.onSelected}
              ref={this.storeInputReference}
            />
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default DTAutosuggest;
