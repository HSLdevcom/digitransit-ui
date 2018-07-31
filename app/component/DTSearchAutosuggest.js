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
    config: PropTypes.object.isRequired,
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    executeSearch: PropTypes.func,
    id: PropTypes.string.isRequired,
    isFocused: PropTypes.func,
    layers: PropTypes.arrayOf(PropTypes.string).isRequired,
    placeholder: PropTypes.string.isRequired,
    refPoint: dtLocationShape.isRequired,
    searchType: PropTypes.oneOf(['all', 'endpoint']).isRequired,
    selectedFunction: PropTypes.func.isRequired,
    value: PropTypes.string,
  };

  static defaultProps = {
    autoFocus: false,
    className: '',
    executeSearch,
    isFocused: () => {},
    value: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      doNotShowLinkToStop: !isEqual(props.layers, getAllEndpointLayers()),
      value: props.value,
      suggestions: [],
      editing: false,
      valid: true,
    };
  }

  componentDidMount = () => {
    if (this.props.autoFocus && this.input) {
      this.input.focus();
    }
  };

  componentWillReceiveProps = nextProps => {
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
      this.setState(
        {
          editing: false,
          value: ref.suggestionValue,
        },
        () => {
          this.input.blur();
          this.props.selectedFunction(ref.suggestion);
        },
      );
    } else {
      this.setState(
        {
          pendingSelection: this.state.value,
        },
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
            this.props.selectedFunction(this.state.suggestions[0]);
          }
        },
      );
    }
  };

  clearButton = () => {
    const img = this.state.value ? 'icon-icon_close' : 'icon-icon_search';
    return (
      <button className="noborder clear-input" onClick={this.clearInput}>
        <Icon img={img} />
      </button>
    );
  };

  fetchFunction = ({ value }) =>
    this.setState({ valid: false }, () => {
      this.props.executeSearch(
        this.context.getStore,
        this.props.refPoint,
        {
          layers: this.props.layers,
          input: value,
          type: this.props.searchType,
          config: this.context.config,
        },
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

  inputClicked = () => {
    if (!this.state.editing) {
      this.props.isFocused(true);
      const newState = {
        editing: true,
        // reset at start, just in case we missed something
        pendingSelection: null,
      };

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
      loading={!this.state.valid}
      useTransportIconsconfig={
        this.context.config.search.suggestions.useTransportIcons
      }
    />
  );

  render() {
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
    };

    return (
      <div className={cx(['autosuggest-input-container', this.props.id])}>
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
            <div id={`${this.props.id}-container`} style={{ display: 'flex' }}>
              <input id={this.props.id} onClick={this.inputClicked} {...p} />
              {this.clearButton()}
            </div>
          )}
          onSuggestionSelected={this.onSelected}
          highlightFirstSuggestion
          ref={this.storeInputReference}
        />
      </div>
    );
  }
}

export default DTAutosuggest;
