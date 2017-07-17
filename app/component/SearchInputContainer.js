import PropTypes from 'prop-types';
import React, { Component } from 'react';
import find from 'lodash/find';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { FormattedMessage, intlShape } from 'react-intl';
import ReactAutowhatever from 'react-autowhatever';
import NetworkError from './NetworkError';
import SuggestionItem from './SuggestionItem';
import CurrentPositionSuggestionItem from './CurrentPositionSuggestionItem';
import { executeSearch, executeSearchImmediate } from '../util/searchUtils';
import { getLabel, getGTFSId, isStop } from '../util/suggestionUtils';
import { saveSearch } from '../action/SearchActions';
import { isBrowser } from '../util/browser';
import Loading from './Loading';

const L = isBrowser ? require('leaflet') : null;

export default class SearchInputContainer extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    intl: intlShape,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    type: PropTypes.string.isRequired,
    onSuggestionSelected: PropTypes.func.isRequired,
    className: PropTypes.string,
    id: PropTypes.string,
    placeholder: PropTypes.string,
    close: PropTypes.func.isRequired,
    sections: PropTypes.bool,
    layers: PropTypes.array,
  };

  state = {
    highlightedItemIndex: 0,
    suggestions: [],
    type: 'endpoint',
  };

  componentDidMount() {
    executeSearchImmediate(this.context.getStore, {
      input: '',
      type: this.props.type,
      layers: this.props.layers,
      config: this.context.config,
    }, this.onSearchChange);
  }

  /*
   * event: [{type: <type>, term:<term>, error: error}]
   */
  onSearchChange = (event) => {
    const inProgress = event === null;
    const results = inProgress ? [] : event;
    if (inProgress && this.state.searchInProgress) {
      return;
    }
    this.setState({
      searchInProgress: inProgress,
      suggestions: results,
      highlightedItemIndex: 0,
    }, () => this.focusItem(0));
  }

  /**
   * Returns object containing results for specified type of undefined if no such results exist
   */
  getItems(typeParam) {
    const type = typeParam || (this.props.type);

    const endpoints = find(this.state.suggestions, ['type', 'endpoint']);

    if (type === 'all') {
      const all = {};
      all.results = get(endpoints, 'results', []);
      const search = find(this.state.suggestions, ['type', 'search']);
      all.results = all.results.concat(get(search, 'results', []));
      all.error = all.results.length === 0 && (get(endpoints, 'error') || get(search, 'error'));
      return all;
    }

    return endpoints;
  }

  getInput() {
    return get(this, 'autowhatever.input', null);
  }

  focusItem(i) {  // eslint-disable-line class-methods-use-this
    if (L.Browser.touch) {
      return;
    }
    const domElement = document.getElementById(`react-autowhatever-suggest--item-${i}`);
    if (domElement != null) {
      domElement.scrollIntoView(false);
    }
  }

  handleOnMouseEnter = (event, eventProps) => {
    if (eventProps.itemIndex != null) {
      if (eventProps.itemIndex !== this.state.highlightedItemIndex) {
        this.setState({
          highlightedItemIndex: eventProps.itemIndex,
        });
      }
      event.preventDefault();
    }
  }

  blur() {
    // hide safari keyboard
    if (this.getInput() != null) {
      this.getInput().blur();
    }
  }

  focus = () => {
    if (this.getInput() != null) {
      this.getInput().focus();
    }
  }

  handleOnKeyDown = (event, eventProps) => {
    if (event.keyCode === 13 && get(this.getItems(), 'results.length', 0) > 0) {
      // enter selects current
      this.currentItemSelected();
      this.blur();
      event.preventDefault();
    }

    if (event.keyCode === 27) {
      // esc clears
      if (this.state.value === '' || this.state.value === null) {
        // or closes if input is empty
        this.props.close();
      } else {
        this.handleUpdateInputNow({
          target: {
            value: '',
          },
        });
        return;
      }

      event.preventDefault();
    }

    if (eventProps.newFocusedItemIndex != null) {
      this.setState({
        highlightedItemIndex: eventProps.newFocusedItemIndex,
      }, () => this.focusItem(eventProps.newFocusedItemIndex));

      event.preventDefault();
    }
  }

  handleOnMouseDown = (event, eventProps) => {
    if (eventProps.itemIndex != null) {
      this.setState({
        highlightedItemIndex: eventProps.itemIndex,
      }, this.currentItemSelected);

      this.blur();
    }
  }

  handleOnTouchStart = () => {
    this.blur();
  }

  handleUpdateInputNow = (event) => {
    const input = event.target.value;

    if (input === this.state.value) {
      return;
    }

    this.setState({
      value: input,
    });

    this.executeSearchWithParams(input);
  }

  executeSearchWithParams=(newinput) => {
    const terms = typeof newinput === 'string' ? newinput : this.state.value;
    executeSearch(this.context.getStore, {
      input: terms,
      type: this.props.type,
      layers: this.props.layers,
      config: this.context.config,
    }, this.onSearchChange);
  }

  currentItemSelected = () => {
    if (this.state.highlightedItemIndex >= 0 && get(this.getItems(), 'results.length', 0) > 0) {
      const item = this.getItems().results[this.state.highlightedItemIndex];
      let name;

      if (item.type === 'CurrentLocation') {
        const state = this.context.getStore('PositionStore').getLocationState();
        item.geometry = { coordinates: [state.lon, state.lat] };
        name = this.context.intl.formatMessage(
          { id: 'own-position', defaultMessage: 'Your current location' },
        );
      } else {
          // type is destination unless timetable of route was clicked
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

        this.context.executeAction(saveSearch, { item, type });
      }

      name = item.properties.label || getLabel(item.properties, true).join(', ');
      const clone = cloneDeep(item);
      if (isStop(get(clone, 'properties')) && clone.timetableClicked === true) {
        clone.properties.link = `/pysakit/${getGTFSId(clone.properties)}`;
      }

      this.props.onSuggestionSelected(name, clone);
    }
  }

  renderItemsOrEmpty(children) {
    let elem;

    const endpointResultCount = get(this.getItems('endpoint'), 'results.length', 0);
    const searchResultCount = get(this.getItems('search'), 'results.length', 0);

    if (get(this.getItems(), 'error', false)) {
      return <NetworkError retry={() => this.executeSearchWithParams()} />;
    } else if (children !== null) {
      // we have results
      return children;
    } else if (this.state.searchInProgress) {
      // Loading in progress
      elem = <Loading />;
    } else if (endpointResultCount === 0 && searchResultCount === 0) {
      // No results
      elem = <FormattedMessage id="search-no-results" defaultMessage="No location" />;
    } else if (children === null && endpointResultCount > 0) {
      // Complex search, Results in destination tab
      elem = <FormattedMessage id="search-destination-results-but-no-search" defaultMessage="'View results in the adjacent “Destination” tab" />;
    } else if (children === null && searchResultCount > 0) {
      // Complex search, Results in search tab
      elem = <FormattedMessage id="search-search-results-but-no-destination" defaultMessage="View results in the adjacent “About the route or stop” tab" />;
    } else {
      throw Error('Rendering results is not working correctly');
    }

    return (
      <ul className="search-no-results">
        <li>
          {elem}
        </li>
      </ul>
    );
  }

  renderSimpleWrapper = ({ children, containerProps }) => (
    <div {...containerProps} >
      {this.renderItemsOrEmpty(children)}
    </div>
  )

  renderItem = (item) => { // eslint-disable-line class-methods-use-this
    if (item.properties.layer === 'currentPosition') {
      return (
        <CurrentPositionSuggestionItem
          ref={item.name}
          item={item}
        />
      );
    }
    return (
      <SuggestionItem
        doNotShowLinkToStop={(this.props.type !== 'all')}
        ref={item.name}
        item={item}
        useTransportIconsconfig={this.context.config.search.suggestions.useTransportIcons}
      />
    );
  }

  render() {
    const inputValue = (
      this.state.value != null &&
        typeof this.state.value === 'string' &&
        this.state.value.length >= 0 ? this.state.value : null
    ) || '';

    return (
      <div>
        <ReactAutowhatever
          ref={(c) => { this.autowhatever = c; }}
          className={this.props.className}
          id="suggest"
          items={get(this.getItems(), 'results', [])}
          renderItem={this.renderItem}
          renderItemsContainer={this.renderSimpleWrapper}
          onSuggestionSelected={this.currentItemSelected}
          highlightedItemIndex={this.state.highlightedItemIndex}
          inputProps={{
            id: this.props.id,
            value: inputValue,
            onChange: this.handleUpdateInputNow,
            onKeyDown: this.handleOnKeyDown,
            onTouchStart: this.handleOnTouchStart,
            placeholder: this.props.placeholder,
          }}
          itemProps={{
            onMouseEnter: this.handleOnMouseEnter,
            onClick: this.handleOnMouseDown,
            onTouchStart: this.handleOnTouchStart,
          }}
        />
      </div>);
  }
}
