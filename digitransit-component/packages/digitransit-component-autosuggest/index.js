/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import i18next from 'i18next';
import cx from 'classnames';
import Autosuggest from 'react-autosuggest';
// import { executeSearch, getAllEndpointLayers } from './searchUtils';
import SuggestionItem from '@digitransit-component/digitransit-component-suggestion-item';
// import { suggestionToAriaContent } from '../digitransit-component-suggestion-item/suggestionUtils';
import translations from './helpers/translations';
import './helpers/styles.scss';

i18next.init({ lng: 'en', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

const Loading = props => (
  <div className="spinner-loader">
    {(props && props.children) || (
      <span className="sr-only">{i18next.t('loading')}</span>
    )}
  </div>
);

Loading.propTypes = {
  children: PropTypes.node,
};

function Icon({ className, color, img, height, width, margin }) {
  return (
    <span aria-hidden className="icon-container">
      <svg
        className={cx('icon', className)}
        style={{
          fill: color || null,
          height: height ? `${height}em` : null,
          width: width ? `${width}em` : null,
          marginRight: margin ? `${margin}em` : null,
        }}
      >
        <use xlinkHref={`#${img}`} />
      </svg>
    </span>
  );
}

Icon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  height: PropTypes.number,
  img: PropTypes.string.isRequired,
  margin: PropTypes.number,
  width: PropTypes.number,
};

Icon.defaultProps = {
  color: undefined,
  height: undefined,
  margin: undefined,
  width: undefined,
};

class DTAutosuggest extends React.Component {
  static propTypes = {
    config: PropTypes.object,
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    executeSearch: PropTypes.func,
    icon: PropTypes.string,
    id: PropTypes.string.isRequired,
    isFocused: PropTypes.func,
    layers: PropTypes.arrayOf(PropTypes.string),
    placeholder: PropTypes.string.isRequired,
    refPoint: PropTypes.object.isRequired,
    searchType: PropTypes.oneOf(['all', 'endpoint', 'search']).isRequired,
    value: PropTypes.string,
    searchContext: PropTypes.any.isRequired,
    ariaLabel: PropTypes.string,
    onSelect: PropTypes.func,
    isPreferredRouteSearch: PropTypes.bool,
    showSpinner: PropTypes.bool,
    storeRef: PropTypes.func,
    handleViaPoints: PropTypes.func,
    getLabel: PropTypes.func,
    focusChange: PropTypes.func,
    language: PropTypes.string,
  };

  static defaultProps = {
    autoFocus: false,
    className: '',
    executeSearch: () => {},
    icon: undefined,
    isFocused: () => {},
    value: '',
    isPreferredRouteSearch: false,
    showSpinner: false,
    layers: [
      'CurrentPosition',
      'FavouritePlace',
      'FavouriteStop',
      'OldSearch',
      'Geocoding',
      'Stops',
    ],
    language: 'en',
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      suggestions: [],
      editing: false,
      valid: true,
      pendingCurrentLocation: false,
    };
  }

  componentDidMount = () => {
    if (this.props.autoFocus && this.input) {
      this.input.focus();
    }
    i18next.changeLanguage(this.props.language);
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
      this.props.isFocused(true);
      this.setState(newState, () => this.fetchFunction({ value: newValue }));
    } else if (method !== 'enter' || this.state.valid) {
      // test above drops unnecessary update
      // when user hits enter but search is unfinished
      this.setState(newState);
    }
  };

  onBlur = () => {
    this.props.isFocused(false);
    this.setState({
      editing: false,
      value: this.props.value,
    });
  };

  onSelected = (e, ref) => {
    this.props.isFocused(false);
    if (this.state.valid) {
      if (this.props.handleViaPoints) {
        // TODO: add and verify this viaPointHandling, since DT-3466 onLocationSelected has been removed
        this.props.handleViaPoints(ref.suggestion, ref.suggestionIndex);
      }
      this.setState(
        {
          editing: false,
          value: ref.suggestionValue,
        },
        () => {
          this.input.blur();
          this.props.onSelect(ref.suggestion, this.props.id);
          if (this.props.focusChange) {
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
    });
  };

  getSuggestionValue = suggestion => {
    const value = this.props.getLabel(suggestion.properties);
    return value;
  };

  checkPendingSelection = () => {
    // accept after all ongoing searches have finished
    if (this.state.pendingSelection && this.state.valid) {
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
    const img = this.state.value ? 'icon-icon_close' : 'icon-icon_search';
    return (
      <button
        className="noborder clear-input"
        onClick={this.clearInput}
        aria-label={i18next.t(
          this.state.value ? 'clear-button-label' : 'search-button-label',
        )}
      >
        <Icon img={img} />
      </button>
    );
  };

  fetchFunction = ({ value }) =>
    this.setState({ valid: false }, () => {
      this.props.executeSearch(
        this.props.searchContext,
        this.props.refPoint,
        {
          layers: this.props.layers,
          input: value,
          type: this.props.searchType,
          config: this.props.config,
        },
        searchResult => {
          if (searchResult == null) {
            return;
          }
          // XXX translates current location
          const suggestions = (searchResult.results || []).map(suggestion => {
            if (suggestion.type === 'CurrentLocation') {
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
            value === this.state.pendingSelection
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
    this.props.isFocused(true);
    this.input.focus();
  };

  inputClicked = inputValue => {
    if (!this.state.editing) {
      this.props.isFocused(true);
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

  renderItem = item => (
    /* eslint-disable react/jsx-no-undef */
    <SuggestionItem
      ref={item.name}
      item={item}
      // intl={this.context.intl}
      loading={!this.state.valid}
      // useTransportIconsconfig={
      //   this.props.config.search.suggestions.useTransportIcons
      // }
    />
  );

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
  };

  suggestionAsAriaContent = () => {
    // const label = [];
    // if (this.state.suggestions[0]) {
    //   label = suggestionToAriaContent(
    //     this.state.suggestions[0],
    //     this.context.intl,
    //     this.props.config.search.suggestions.useTransportIcons,
    //   );
    // }
    // return label ? label.join(' - ') : '';
    return 'placeholder';
  };

  render() {
    if (this.props.showSpinner && this.state.pendingCurrentLocation) {
      return <Loading />;
    }
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: i18next.t(this.props.placeholder),
      value,
      onChange: this.onChange,
      onBlur: this.onBlur,
      className: `react-autosuggest__input ${this.props.className}`,
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
      <div className={cx(['autosuggest-input-container', this.props.id])}>
        {this.props.icon && (
          <div className={cx(['autosuggest-input-icon', this.props.id])}>
            <Icon img={`icon-icon_${this.props.icon}`} />
          </div>
        )}
        <Autosuggest
          id={this.props.id}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.fetchFunction}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderItem}
          inputProps={inputProps}
          focusInputOnSuggestionClick={false}
          shouldRenderSuggestions={() => this.state.editing}
          highlightFirstSuggestion
          renderInputComponent={p => (
            <>
              <input
                aria-label={SearchBarId.concat(' ').concat(ariaLabelText)}
                id={this.props.id}
                onClick={this.inputClicked}
                onKeyDown={this.keyDown}
                {...p}
              />
              <span
                className="sr-only"
                role="alert"
                // aria-hidden={!this.state.editing}
              >
                {ariaSuggestionLen}
              </span>
              <span
                className="sr-only"
                role="alert"
                aria-hidden={!this.state.editing || suggestions.length === 0}
              >
                {ariaCurrentSuggestion}
              </span>
              {this.clearButton()}
            </>
          )}
          onSuggestionSelected={this.onSelected}
          ref={this.storeInputReference}
        />
      </div>
    );
  }
}

export default DTAutosuggest;
