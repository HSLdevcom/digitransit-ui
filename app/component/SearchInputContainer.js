import React, { Component, PropTypes } from 'react';
import find from 'lodash/find';
import get from 'lodash/get';
import cx from 'classnames';
import { FormattedMessage, intlShape } from 'react-intl';
import ReactAutowhatever from 'react-autowhatever';
import NetworkError from './NetworkError';
import SuggestionItem from './SuggestionItem';
import CurrentPositionSuggestionItem from './CurrentPositionSuggestionItem';
import { executeSearch, executeSearchImmediate } from '../util/searchUtils';
import { getLabel } from '../util/suggestionUtils';
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
    children: PropTypes.node,
    close: PropTypes.func.isRequired,
    sections: PropTypes.bool,
    layers: React.PropTypes.array,
  };

  state = {
    focusedItemIndex: 0,
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
      focusedItemIndex: 0,
    }, () => this.focusItem(0));
  }

  onSwitchTab = (tab) => {
    this.setState({
      type: tab,
      focusedItemIndex: 0,
    }, () => {
      this.focusItem(0);
      this.focus();
    });
  }

  /**
   * Returns object containing results for specified type of undefined if no such results exist
   */
  getItems(typeParam) {
    const type = typeParam || (this.props.type === 'all' ? this.state.type : this.props.type);
    const result = find(this.state.suggestions, ['type', type]);
    return result;
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
      if (eventProps.itemIndex !== this.state.focusedItemIndex) {
        this.setState({
          focusedItemIndex: eventProps.itemIndex,
        });
      }
      event.preventDefault();
    }
  }

  blur() {
    // hide safari keyboard
    this.autowhatever.input.blur();
  }

  focus = () => {
    this.autowhatever.input.focus();
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
        focusedItemIndex: eventProps.newFocusedItemIndex,
      }, () => this.focusItem(eventProps.newFocusedItemIndex));

      event.preventDefault();
    }
  }

  handleOnMouseDown = (event, eventProps) => {
    if (eventProps.itemIndex != null) {
      this.setState({
        focusedItemIndex: eventProps.itemIndex,
      }, this.currentItemSelected);

      this.blur();
      event.preventDefault();
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
    if (this.state.focusedItemIndex >= 0 && get(this.getItems(), 'results.length', 0) > 0) {
      const item = this.getItems().results[this.state.focusedItemIndex];
      let name;

      if (item.type === 'CurrentLocation') {
        const state = this.context.getStore('PositionStore').getLocationState();
        item.geometry = { coordinates: [state.lon, state.lat] };
        name = this.context.intl.formatMessage(
          { id: 'own-position', defaultMessage: 'Your current location' },
        );
      } else {
        const type = (this.props.type === 'all' && this.state.type) || this.props.type;
        this.context.executeAction(saveSearch, { item, type });
        name = item.properties.label || getLabel(item.properties).join(', ');
      }

      this.props.onSuggestionSelected(name, item);
    }
  }

  clearInput = () => {
    this.handleUpdateInputNow({ target: { value: '' } });
    this.focus();
  };

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

  renderSimpleWrapper = ({ children, ...rest }) => (
    <div {...rest} >
      {this.renderItemsOrEmpty(children)}
    </div>
  )

  renderMultiWrapper = ({ children, ...rest }) => (
    <div {...rest} >
      <div className="react-autowhatever__type-selector">
        <a
          onClick={() => this.onSwitchTab('endpoint')}
          className={cx({ selected: this.state.type === 'endpoint' })}
          id="endpoint-tab"
        >
          <FormattedMessage id="destination" defaultMessage="Destination" />
          {this.state.type !== 'endpoint' && (
            <span className="item-count">
              {get(this.getItems('endpoint'), 'results.length', 0)}
            </span>
          )}
        </a>
        <a
          onClick={() => this.onSwitchTab('search')}
          className={cx({ selected: this.state.type === 'search' })}
          id="search-tab"
        >
          <FormattedMessage id="route-stop-or-keyword" defaultMessage="About the route or stop" />
          {this.state.type !== 'search' && (
            <span className="item-count">
              {get(this.getItems('search'), 'results.length', 0)}
            </span>
          )}
        </a>
      </div>
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
          renderItemsContainer={this.props.type === 'all' ? this.renderMultiWrapper : this.renderSimpleWrapper}
          onSuggestionSelected={this.currentItemSelected}
          focusedItemIndex={this.state.focusedItemIndex}
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
        {this.props.children}
      </div>);
  }
}
