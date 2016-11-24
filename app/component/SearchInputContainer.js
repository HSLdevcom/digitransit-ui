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
import Icon from './Icon';

const L = typeof window !== 'undefined' ? require('leaflet') : null;

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
    initialValue: PropTypes.string,
    children: PropTypes.node,
    close: PropTypes.func.isRequired,
    sections: PropTypes.bool,
  };

  state = {
    focusedItemIndex: 0,
    suggestions: [],
    value: this.props.initialValue,
    type: 'endpoint',
  };

  componentDidMount() {
    executeSearchImmediate(this.context.getStore, {
      input: '',
      type: this.props.type,
    }, this.onSearchChange);
  }

  onSearchChange = (data) => {
    this.setState({
      suggestions: data,
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
    return this.state.suggestions || [];
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
          { id: 'own-position', defaultMessage: 'Current position' }
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
      {children}
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
        this.state.value.length >= 0 ? this.state.value : this.props.initialValue
    ) || '';

    return (
      <div>
        <ReactAutowhatever
          ref={(c) => { this.autowhatever = c; }}
          className={this.props.className}
          id="suggest"
          items={this.getItems()}
          renderItem={this.renderItem}
          renderItemsContainer={this.props.type === 'all' ? this.renderMultiWrapper : undefined}
          onSuggestionSelected={this.currentItemSelected}
          focusedItemIndex={this.state.focusedItemIndex}
          inputProps={{
            id: this.props.id,
            value: inputValue,
            onChange: this.handleUpdateInputNow,
            onKeyDown: this.handleOnKeyDown,
            onTouchStart: this.handleOnTouchStart,
          }}
          itemProps={{
            onMouseEnter: this.handleOnMouseEnter,
            onClick: this.handleOnMouseDown,
            onTouchStart: this.handleOnTouchStart,
          }}
        />
        {inputValue.length > 0 ? (
          <div
            className="clear-icon"
            onClick={this.clearInput}
          >
            <Icon img="icon-icon_close" />
          </div>
        ) : false
        }
        {this.props.children}
      </div>);
  }
}
