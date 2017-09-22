import PropTypes from 'prop-types';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import { executeSearch } from '../util/searchUtils';
import CurrentPositionSuggestionItem from './CurrentPositionSuggestionItem';
import SuggestionItem from './SuggestionItem';
import { getLabel } from '../util/suggestionUtils';

function getSuggestionValue(suggestion) {
  const value = getLabel(suggestion.properties, true);
  return value;
}

const renderItem = item => {
  // eslint-disable-line class-methods-use-this
  if (item.properties.layer === 'currentPosition') {
    // todo this is not needed
    return <CurrentPositionSuggestionItem ref={item.name} item={item} />;
  }
  return (
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
};

class DTAutosuggest extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    selectedFunction: PropTypes.func,
    placeholder: PropTypes.string,
    autoFocus: PropTypes.bool,
    searchType: PropTypes.string.isRequired,
  };

  static defaultProps = {
    placeholder: '',
    clickFunction: () => {},
    autoFocus: false,
  };

  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
    };
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.fetchFunction(value, this.suggestionsDataReceived);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  fetchFunction = (input, cb) => {
    const getStore = this.context.getStore;
    const config = this.context.config;

    executeSearch(
      getStore,
      {
        input,
        type: this.props.searchType,
        config,
      },
      result => {
        if (result == null) {
          // cb([]);
          return;
        }
        const [res1, res2] = result;

        let res = [];
        if (res2 && res2.results) {
          res = res.concat(res2.results);
        }
        if (res1 && res1.results) {
          res = res.concat(res1.results);
        }
        console.log('got results:', res);
        cb(res);
      },
    );
  };

  suggestionsDataReceived = suggestions => {
    this.setState({
      suggestions,
    });
  };
  render = () => {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: this.props.placeholder,
      value,
      onChange: this.onChange,
      autoFocus: this.props.autoFocus,
    };

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderItem}
        inputProps={inputProps}
        onSuggestionSelected={this.props.selectedFunction}
      />
    );
  };
}

export default DTAutosuggest;
