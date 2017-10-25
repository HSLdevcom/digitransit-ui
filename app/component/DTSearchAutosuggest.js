import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Autosuggest from 'react-autosuggest';
import { executeSearch } from '../util/searchUtils';
import SuggestionItem from './SuggestionItem';
import { getLabel } from '../util/suggestionUtils';
import { dtLocationShape } from '../util/shapes';
import Icon from './Icon';

function getSuggestionValue(suggestion) {
  const value = getLabel(suggestion.properties, true);
  return value;
}

const renderItem = item => (
  <SuggestionItem
    doNotShowLinkToStop={
      false
      // todo convert to component prop!! this.props.type !== 'all'
    }
    ref={item.name}
    item={item}
    useTransportIconsconfig={
      false // this.context.config.search.suggestions.useTransportIcons
    }
  />
);

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
  };

  static defaultProps = {
    placeholder: '',
    clickFunction: () => {},
    autoFocus: false,
    postInput: null,
    id: 1,
  };

  constructor(props) {
    super(props);

    this.state = {
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

  onChange = (event, { newValue, method }) => {
    const newState = {
      editing: true,
      value: newValue,
    };
    this.props.isFocused(true);
    if (!this.state.suggestions.length) {
      this.fetchFunction(
        {
          value: newValue,
        },
        newState,
      );
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

  clearInput = () => {
    const newState = {
      editing: true,
      value: '',
    };
    if (this.state.value) { // must update suggestions
      this.fetchFunction({value: ''}, newState);
    } else {
      this.setState(newState);
    }
    this.props.isFocused(true);
    if (this.input) {
      this.input.focus();
    }
  };

  inputClicked = () => {
    this.props.isFocused(true);
    if(!this.state.editing) {
      const newState = {editing: true};

      if (!this.state.suggestions.length) {
        this.fetchFunction(
          {
            value: this.state.value,
          },
          newState,
        );
      } else {
        this.setState(newState);
      }
    }
  }

  fetchFunction = ({ value },  state) => { /// state is optional
    executeSearch(
      this.context.getStore,
      this.props.refPoint,
      {
        input: value,
        type: this.props.searchType,
        config: this.context.config,
      },
      result => {
        let suggestions = [];

        if (result !== null) {
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
        }

        const newState = state || {};
        this.setState({
          ...state,
          suggestions,
        });
      },
    );
  };

  clearButton = () =>
    this.state.value && !this.state.editing ? (
      <button className="noborder clear-input" onClick={this.clearInput}>
        <Icon img="icon-icon_close" />
      </button>
    ) : null;

  storeInputReference = autosuggest => {
    if (autosuggest !== null) {
      this.input = autosuggest.input;
    }
  };

  render = () => {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: this.context.intl.formatMessage({
        id: this.props.placeholder,
        defaultMessage: 'TODO',
      }),
      value,
      onChange: this.onChange,
      onBlur: this.onBlur,
      onFocus: this.onFocus,
      autoFocus: this.props.autoFocus,
      className: `react-autosuggest__input ${this.props.className}`,
    };

    return (
      <Autosuggest
        id={this.props.id}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.fetchFunction}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderItem}
        inputProps={inputProps}
        focusInputOnSuggestionClick={false}
        shouldRenderSuggestions={() => (this.state.editing) }
        renderInputComponent={p => (
          <div style={{ position: 'relative', display: 'flex' }}>
            <input onClick={ this.inputClicked }  {...p} />
            {this.props.renderPostInput}
            {this.clearButton()}
          </div>
        )}
        onSuggestionSelected={this.onSelected}
        highlightFirstSuggestion
        ref={this.storeInputReference}
      />
    );
  };
}

export default DTAutosuggest;
