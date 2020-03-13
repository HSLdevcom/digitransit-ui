import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { routerShape } from 'found';
import { intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Autosuggest from 'react-autosuggest';
import isEqual from 'lodash/isEqual';
import { executeSearch, getAllEndpointLayers } from '../util/searchUtils';
import SuggestionItem from './SuggestionItem';
import { dtLocationShape } from '../util/shapes';
import Icon from './Icon';
import getRelayEnvironment from '../util/getRelayEnvironment';
import { getJson } from '../util/xhrPromise';
import { saveSearch } from '../action/SearchActions';
import Loading from './Loading';
import {
  suggestionToLocation,
  getGTFSId,
  isStop,
  getLabel,
} from '../util/suggestionUtils';
import { PREFIX_STOPS, PREFIX_TERMINALS } from '../util/path';
import { startLocationWatch } from '../action/PositionActions';
import PositionStore from '../store/PositionStore';

class DTAutosuggest extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    relayEnvironment: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
  };

  static propTypes = {
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    executeSearch: PropTypes.func,
    icon: PropTypes.string,
    id: PropTypes.string.isRequired,
    isFocused: PropTypes.func,
    layers: PropTypes.arrayOf(PropTypes.string),
    placeholder: PropTypes.string.isRequired,
    refPoint: dtLocationShape.isRequired,
    searchType: PropTypes.oneOf(['all', 'endpoint', 'search']).isRequired,
    // selectedFunction: PropTypes.func.isRequired,
    value: PropTypes.string,
    searchContext: PropTypes.any.isRequired,
    relayEnvironment: PropTypes.object.isRequired,
    ariaLabel: PropTypes.string,
    onSelect: PropTypes.func,
    onLocationSelected: PropTypes.func.isRequired,
    onRouteSelected: PropTypes.func,
    isPreferredRouteSearch: PropTypes.bool,
    locationState: PropTypes.object.isRequired,
    showSpinner: PropTypes.bool,
  };

  static defaultProps = {
    autoFocus: false,
    className: '',
    executeSearch,
    icon: undefined,
    isFocused: () => {},
    value: '',
    isPreferredRouteSearch: false,
    onRouteSelected: undefined,
    showSpinner: false,
    layers: getAllEndpointLayers(),
  };

  constructor(props) {
    super(props);

    this.state = {
      doNotShowLinkToStop: !isEqual(props.layers, getAllEndpointLayers()),
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
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps = nextProps => {
    const locState = nextProps.locationState;
    // wait until address is set or geolocationing fails
    if (
      this.state.pendingCurrentLocation &&
      (locState.status === PositionStore.STATUS_FOUND_ADDRESS ||
        locState.locationingFailed)
    ) {
      this.setState({ pendingCurrentLocation: false }, () => {
        if (locState.status === PositionStore.STATUS_FOUND_ADDRESS) {
          const location = {
            type: 'CurrentLocation',
            lat: locState.lat,
            lon: locState.lon,
            address:
              locState.address ||
              this.context.intl.formatMessage({
                id: 'own-position',
                defaultMessage: 'Own Location',
              }),
          };
          nextProps.onLocationSelected(location);
        }
      });
    }
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
    this.setState(prevState => ({
      editing: false,
      value: prevState.value, // DT-3263: changed this.state.value from this.props.value
    }));
  };

  onSelected = (e, ref) => {
    this.props.isFocused(false);
    if (this.state.valid) {
      this.setState(
        {
          editing: false,
          value: ref.suggestionValue,
        },
        () => {
          this.input.blur();
          this.onSelect(ref.suggestion);
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

  // DT-3263: not clear automatically suggestions: [] (e.g. user comes back with tabulator)
  onSuggestionsClearRequested = () => {
    /* this.setState({
      suggestions: [],
    }); */
  };

  getSuggestionValue = suggestion => {
    const value = getLabel(suggestion.properties);
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
            this.onSelect(this.state.suggestions[0]);
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
        aria-label={this.context.intl.formatMessage({
          id: this.state.value ? 'clear-button-label' : 'search-button-label',
        })}
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
          config: this.context.config,
        },
        this.props.relayEnvironment,
        searchResult => {
          if (searchResult == null) {
            return;
          }
          // XXX translates current location
          const suggestions = (searchResult.results || []).map(suggestion => {
            if (suggestion.type === 'CurrentLocation') {
              const translated = { ...suggestion };
              translated.properties.labelId = this.context.intl.formatMessage({
                id: suggestion.properties.labelId,
                defaultMessage: 'Own Location',
              });
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
    }
  };

  renderItem = item => (
    <SuggestionItem
      doNotShowLinkToStop={this.state.doNotShowLinkToStop}
      ref={item.name}
      item={item}
      intl={this.context.intl}
      loading={!this.state.valid}
      useTransportIconsconfig={
        this.context.config.search.suggestions.useTransportIcons
      }
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

  // DT-3263 ends
  finishSelect = (item, type) => {
    if (item.type.indexOf('Favourite') === -1) {
      this.context.executeAction(saveSearch, { item, type });
    }
    // this.onSelect(item, type);
  };

  onSelect = item => {
    // type is destination unless timetable or route was clicked
    let type = 'endpoint';
    switch (item.type) {
      case 'Stop': // stop can be timetable or
        if (item.timetableClicked === true) {
          type = 'search';
        }
        break;
      case 'Route':
        type = 'search';
        break;
      default:
    }

    if (item.type === 'OldSearch' && item.properties.gid) {
      getJson(this.context.config.URL.PELIAS_PLACE, {
        ids: item.properties.gid,
      }).then(data => {
        const newItem = { ...item };
        if (data.features != null && data.features.length > 0) {
          // update only position. It is surprising if, say, the name changes at selection.
          const geom = data.features[0].geometry;
          newItem.geometry.coordinates = geom.coordinates;
        }
        this.finishSelect(newItem, type);
        this.onSuggestionSelected(item);
      });
    } else {
      this.finishSelect(item, type);
      this.onSuggestionSelected(item);
    }
  };

  onSuggestionSelected = item => {
    // preferred route selection
    if (this.props.isPreferredRouteSearch && this.props.onRouteSelected) {
      this.props.onRouteSelected(item);
      return;
    }
    // stop
    if (item.timetableClicked === true) {
      const prefix = isStop(item.properties) ? PREFIX_STOPS : PREFIX_TERMINALS;

      const url = `/${prefix}/${getGTFSId(item.properties)}`;
      this.context.router.push(url);
      return;
    }

    // route
    if (item.properties.link) {
      this.context.router.push(item.properties.link);
      return;
    }
    const location = suggestionToLocation(item);

    if (item.properties.layer === 'currentPosition' && !item.properties.lat) {
      this.setState({ pendingCurrentLocation: true }, () =>
        this.context.executeAction(startLocationWatch),
      );
    } else {
      this.props.onLocationSelected(location);
    }
  };

  shouldcomponentUpdate = (nextProps, nextState) => {
    if (
      this.state.pendingCurrentLocation !== nextState.pendingCurrentLocation
    ) {
      return true;
    }
    let changed;
    Object.keys(nextProps).forEach(key => {
      // shallow compare
      if (key !== 'locationState' && this.props[key] !== nextProps[key]) {
        changed = true;
      }
    });
    if (changed) {
      return true;
    }
    const oldLocState = this.props.locationState;
    const newLocState = nextProps.locationState;
    const oldGeoloc =
      oldLocState.status === PositionStore.STATUS_FOUND_ADDRESS ||
      oldLocState.status === PositionStore.STATUS_FOUND_LOCATION;
    const newGeoloc =
      newLocState.status === PositionStore.STATUS_FOUND_ADDRESS ||
      newLocState.status === PositionStore.STATUS_FOUND_LOCATION;
    if (oldGeoloc && newGeoloc) {
      // changes between found-location / found-address do not count
      return false;
    }
    return oldLocState.status !== newLocState.status;
  };

  render() {
    if (this.props.showSpinner && this.state.pendingCurrentLocation) {
      return <Loading />;
    }

    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: this.context.intl.formatMessage({
        id: this.props.placeholder,
        defaultMessage: '',
      }),
      value,
      onChange: this.onChange,
      onBlur: this.onBlur,
      className: `react-autosuggest__input ${this.props.className}`,
      onKeyDown: this.keyDown, // DT-3263
    };
    const ariaBarId = this.props.id.replace('searchfield-', '');
    let SearchBarId =
      this.props.ariaLabel ||
      this.context.intl.formatMessage({
        id: ariaBarId,
        defaultMessage: ariaBarId,
      });
    SearchBarId = SearchBarId.replace('searchfield-', '');
    const ariaLabelText = this.context.intl.formatMessage({
      id: 'search-autosuggest-label',
      defaultMessage: 'Search for places, stops and timetables.',
    });
    const ariaSuggestionLen = this.context.intl.formatMessage(
      {
        id: 'search-autosuggest-len',
        defaultMessage: 'There are {len} Suggestions available',
      },
      { len: suggestions.length },
    );
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
              <span className="sr-only" role="alert">
                {ariaSuggestionLen}
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

export default getRelayEnvironment(
  connectToStores(DTAutosuggest, [PositionStore], context => ({
    locationState: context.getStore(PositionStore).getLocationState(),
  })),
);
