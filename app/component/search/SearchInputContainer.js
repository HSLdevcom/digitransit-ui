import React, { Component, PropTypes } from 'react';
import ReactAutowhatever from 'react-autowhatever';
import { getLabel } from '../../util/suggestionUtils';
import SuggestionItem from './SuggestionItem';
import CurrentPositionItem from './current-position-suggestion-item';
import { executeSearch, saveSearch, closeSearch } from '../../action/SearchActions';
import Icon from '../icon/icon';

const L = typeof window !== 'undefined' ? require('leaflet') : null;

export default class SearchInputContainer extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  static propTypes = {
    type: PropTypes.string.isRequired,
    onSuggestionSelected: PropTypes.func.isRequired,
    className: PropTypes.string,
    id: PropTypes.string,
    initialValue: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.initialValue = props.initialValue != null ? props.initialValue : '';
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this);
    this.handleOnMouseDown = this.handleOnMouseDown.bind(this);
    this.handleOnTouchStart = this.handleOnTouchStart.bind(this);
    this.handleUpdateInputNow = this.handleUpdateInputNow.bind(this);
    this.currentItemSelected = this.currentItemSelected.bind(this);
    this.render = this.render.bind(this);
  }

  state = {
    focusedItemIndex: 0,
    suggestions: [],
  };

  componentWillMount() {
    this.context.getStore('SearchStore').addChangeListener(this.onSearchChange);
  }

  componentWillUnmount() {
    this.context.getStore('SearchStore').removeChangeListener(this.onSearchChange);
  }

  onSearchChange = (payload) => {
    if (payload.action === 'suggestions' && Array.isArray(payload.data)) {
      this.setState({
        suggestions: payload.data,
        focusedItemIndex: 0,
      }, () => this.focusItem(0));
    }
  }

  focusItem = i => {
    if (L.Browser.touch) { return; }
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
    this.refs.autowhatever.refs.input.blur();
  }

  handleOnKeyDown = (event, eventProps) => {
    if (event.keyCode === 13) {
      // enter selects current
      this.currentItemSelected();
      this.blur();
      event.preventDefault();
    }

    if (event.keyCode === 27) {
      // esc clears
      if (this.state.value === '') {
        this.context.executeAction(closeSearch);
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

  handleOnMouseDown(event, eventProps) {
    if (eventProps.itemIndex != null) {
      this.setState({
        focusedItemIndex: eventProps.itemIndex,
      }, this.currentItemSelected);

      this.blur();
      event.preventDefault();
    }
  }

  handleOnTouchStart() {
    this.blur();
  }

  handleUpdateInputNow(event) {
    const input = event.target.value;

    if (input === this.state.value) {
      return;
    }

    this.setState({
      value: input,
    });

    this.context.executeAction(executeSearch, {
      input: event.target.value,
      type: this.props.type,
    });
  }

  currentItemSelected() {
    let save;
    let state;
    let name;
    let item;

    if (this.state.focusedItemIndex >= 0 && this.state.suggestions != null
      && this.state.suggestions.length > 0) {
      item = this.state.suggestions[this.state.focusedItemIndex];
      name = getLabel(item.properties);

      if (item.type === 'CurrentLocation') {
        state = this.context.getStore('PositionStore').getLocationState();

        item.geometry = {
          coordinates: [state.lon, state.lat],
        };

        name = 'Nykyinen sijainti';
      } else {
        save = () => this.context.executeAction(saveSearch, {
          address: name,
          geometry: item.geometry,
          properties: {
            mode: item.properties.mode,
          },
          type: this.props.type,
        });

        setTimeout(save, 0);
      }

      this.props.onSuggestionSelected(name, item);

      this.setState({
        value: name,
      });
    }
  }

  render() {
    const inputValue = this.state.value != null && typeof this.state.value === 'string'
      && this.state.value.length >= 0 ? this.state.value : this.initialValue;

    return (
      <div className="fullscreen">
        <ReactAutowhatever
          ref="autowhatever"
          className={this.props.className}
          id="suggest"
          items={this.state.suggestions}
          renderItem={(item) => (item.properties.layer === 'currentPosition' ?
            <CurrentPositionItem ref={item.name} item={item} spanClass="autosuggestIcon" /> :
            <SuggestionItem ref={item.name} item={item} spanClass="autosuggestIcon" />
          )}
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
            onMouseDown: this.handleOnMouseDown,
            onMouseTouch: this.handleOnMouseDown,
            onTouchStart: this.handleOnTouchStart,
          }}
        />
        {inputValue.length > 0 ? (
          <div
            className="clear-icon"
            onClick={() => this.handleUpdateInputNow({ target: { value: '' } })}
          >
            <Icon img="icon-icon_close" />
          </div>
        ) : false
        }
        {this.props.children}
      </div>);
  }
}
