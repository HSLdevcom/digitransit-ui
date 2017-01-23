import React, { Component, PropTypes } from 'react';
import find from 'lodash/find';
import cx from 'classnames';
import { FormattedMessage, intlShape } from 'react-intl';

import ReactAutowhatever from 'react-autowhatever';
import SuggestionItem from './SuggestionItem';
import CurrentPositionSuggestionItem from './CurrentPositionSuggestionItem';
import { executeSearch, executeSearchImmediate } from '../util/searchUtils';
import { getLabel } from '../util/suggestionUtils';
import { saveSearch } from '../action/SearchActions';
import { isBrowser } from '../util/browser';

const L = isBrowser ? require('leaflet') : null;

export default class SearchInputContainer extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    intl: intlShape,
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
    }, this.onSearchChange);
  }

  onSearchChange = (data) => {
    const inProgress = data == null;
    const results = inProgress ? [] : data;
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

  getItems() {
    if (this.props.type === 'all') {
      const suggestions = find(this.state.suggestions, ['name', this.state.type]);
      return (suggestions && suggestions.items) || [];
    }
    return this.state.suggestions;
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
    if (event.keyCode === 13 && this.getItems().length > 0) {
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

    executeSearch(this.context.getStore, {
      input: event.target.value,
      type: this.props.type,
      layers: this.props.layers,
    }, this.onSearchChange);
  }

  currentItemSelected = () => {
    if (this.state.focusedItemIndex >= 0 && this.getItems().length > 0) {
      const item = this.getItems()[this.state.focusedItemIndex];
      let name;

      if (item.type === 'CurrentLocation') {
        const state = this.context.getStore('PositionStore').getLocationState();
        item.geometry = { coordinates: [state.lon, state.lat] };
        name = this.context.intl.formatMessage(
          { id: 'own-position', defaultMessage: 'Current position' },
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
    if (children != null) {
      // we have results
      return children;
    } else if (this.state.searchInProgress) {
      // Loading in progress
      elem = <div className="spinner-loader" />;
    } else if (
        this.state.suggestions.length === 0 ||
        (this.state.suggestions[0].items.length === 0 &&
        this.state.suggestions[1].items.length === 0)) {
      // No results
      elem = <FormattedMessage id="search-no-results" defaultMessage="No results" />;
    } else if (children === null && this.state.suggestions[0].items.length > 0) {
      // Complex search, Results in destination tab
      elem = <FormattedMessage id="search-destination-results-but-no-search" defaultMessage="See results from Destination tab" />;
    } else if (children === null && this.state.suggestions[1].items.length > 0) {
      // Complex search, Results in search tab
      elem = <FormattedMessage id="search-search-results-but-no-destination" defaultMessage="See results from &quot;Route, stop or keyword&quot; tab" />;
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
              {(find(this.state.suggestions, ['name', 'endpoint']) || { items: [] }).items.length}
            </span>
          )}
        </a>
        <a
          onClick={() => this.onSwitchTab('search')}
          className={cx({ selected: this.state.type === 'search' })}
          id="search-tab"
        >
          <FormattedMessage id="route-stop-or-keyword" defaultMessage="Route, stop or keyword" />
          {this.state.type !== 'search' && (
            <span className="item-count">
              {(find(this.state.suggestions, ['name', 'search']) || { items: [] }).items.length}
            </span>
          )}
        </a>
      </div>
      {this.renderItemsOrEmpty(children)}
    </div>
  )

  renderItem(item) { // eslint-disable-line class-methods-use-this
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
          items={this.getItems()}
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
