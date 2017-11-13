import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import Autosuggest from 'react-autosuggest';
import isEqual from 'lodash/isEqual';
import { executeSearch, getAllEndpointLayers } from '../util/searchUtils';
import SuggestionItem from './SuggestionItem';
import { getLabel } from '../util/suggestionUtils';
import { dtLocationShape } from '../util/shapes';
import Icon from './Icon';

class DTAutosuggest extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    selectedFunction: PropTypes.func,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string,
    autoFocus: PropTypes.bool,
    searchType: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    renderPostInput: PropTypes.node,
    isFocused: PropTypes.func,
    refPoint: dtLocationShape.isRequired,
    layers: PropTypes.array.isRequired,
  };

  static defaultProps = {
    placeholder: '',
    clickFunction: () => {},
    isFocused: () => {},
    autoFocus: false,
    postInput: null,
    id: 1,
  };

  constructor(props) {
    super(props);

    this.state = {
      doNotShowLinkToStop: !isEqual(props.layers, getAllEndpointLayers()),
      value: props.value,
      suggestions: [],
      editing: false,
    };
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.value !== this.state.value && !this.state.editing) {
      this.setState({
        value: nextProps.value,
      });
    }
  };

  onChange = (event, { newValue }) => {
    const newState = {
      value: newValue,
    };
    if (!this.state.editing) {
      newState.editing = true;
      this.props.isFocused(true);
      this.setState(newState, () => this.fetchFunction({ value: newValue }));
    } else {
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
    this.setState({
      editing: false,
      value: ref.suggestionValue,
    });
    this.props.selectedFunction(e, ref);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  getSuggestionValue = suggestion => {
    const value = getLabel(suggestion.properties, true);
    return value;
  };

  clearButton = () =>
    this.state.value ? (
      <button className="noborder clear-input" onClick={this.clearInput}>
        <Icon img="icon-icon_close" />
      </button>
    ) : null;

  fetchFunction = ({ value }) => {
    executeSearch(
      this.context.getStore,
      this.props.refPoint,
      {
        layers: this.props.layers,
        input: value,
        type: this.props.searchType,
        config: this.context.config,
      },
      result => {
        if (result == null) {
          return;
        }
        let suggestions = [];
        const [res1, res2] = result;

        if (res2 && res2.results) {
          suggestions = suggestions.concat(res2.results);
        }
        if (res1 && res1.results) {
          suggestions = suggestions.concat(res1.results);
        }
        // XXX translates current location
        suggestions = suggestions.map(suggestion => {
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
        this.setState({
          suggestions,
        });
      },
    );
  };

  clearInput = () => {
    const newState = {
      editing: true,
      value: '',
    };
    if (this.state.value) {
      // must update suggestions
      this.setState(newState, () => this.fetchFunction({ value: '' }));
    } else {
      this.setState(newState);
    }
    this.props.isFocused(true);
    this.input.focus();
  };

  inputClicked = () => {
    if (!this.state.editing) {
      this.props.isFocused(true);
      const newState = { editing: true };

      if (!this.state.suggestions.length) {
        this.setState(newState, () =>
          this.fetchFunction({ value: this.state.value }),
        );
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
      useTransportIconsconfig={
        this.context.config.search.suggestions.useTransportIcons
      }
    />
  );

  render = () => {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: this.context.intl.formatMessage({
        id: this.props.placeholder,
        defaultMessage: '',
      }),
      value,
      onChange: this.onChange,
      onBlur: this.onBlur,
      onFocus: this.onFocus,
      autoFocus: this.props.autoFocus,
      className: `react-autosuggest__input ${this.props.className}`,
    };

    return (
      <div style={{ position: 'relative' }}>
        <div className={cx(['autosuggest-input-icon', this.props.id])}>
          <Icon img="icon-icon_mapMarker-point" />
        </div>
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
          renderInputComponent={p => (
            <div style={{ position: 'relative', display: 'flex' }}>
              <input id={this.props.id} onClick={this.inputClicked} {...p} />
              {this.clearButton()}
              {this.props.renderPostInput}
            </div>
          )}
          onSuggestionSelected={this.onSelected}
          highlightFirstSuggestion
          ref={this.storeInputReference}
        />
      </div>
    );
  };
}

export default DTAutosuggest;
