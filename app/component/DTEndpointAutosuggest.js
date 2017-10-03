import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { routerShape } from 'react-router';
import DTOldSearchSavingAutosuggest from './DTOldSearchSavingAutosuggest';
import { getLabel, getGTFSId, isStop } from '../util/suggestionUtils';

class DTAutosuggestContainer extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
  };

  static propTypes = {
    searchType: PropTypes.string.isRequired,
    autoFocus: PropTypes.bool,
    onLocationSelected: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    autoFocus: false,
    className: '',
  };

  constructor() {
    super();

    this.state = {};
  }

  onSuggestionSelected = item => {
    const name = getLabel(item.properties, true);
    const clone = cloneDeep(item);
    if (isStop(get(clone, 'properties')) && clone.timetableClicked === true) {
      clone.properties.link = `/pysakit/${getGTFSId(clone.properties)}`;

      this.onSuggestionSelected(name, clone);
    }

    if (item.properties.link !== undefined) {
      this.context.router.push(item.properties.link);
      return;
    }

    const location = {
      address: name,
      lat: item.geometry.coordinates[1],
      lon: item.geometry.coordinates[0],
    };

    this.props.onLocationSelected(location);
  };

  render = () => (
    <DTOldSearchSavingAutosuggest
      autoFocus={this.props.autoFocus}
      placeholder={this.props.placeholder}
      searchType={this.props.searchType}
      onSelect={this.onSuggestionSelected}
      value={this.props.value}
      id={this.props.id}
      className={this.props.value !== '' ? this.props.className : ''}
    />
  );
}

export default DTAutosuggestContainer;
