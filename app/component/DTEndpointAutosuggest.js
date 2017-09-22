import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import DTOldSearchSavingAutosuggest from './DTOldSearchSavingAutosuggest';
import { setEndpoint } from '../action/EndpointActions';
import { getLabel, getGTFSId, isStop } from '../util/suggestionUtils';

class DTAutosuggestContainer extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    target: PropTypes.string.isRequired,
    searchType: PropTypes.string.isRequired,
    autoFocus: PropTypes.bool,
  };

  static defaultProps = {
    autoFocus: false,
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

    this.context.executeAction(setEndpoint, {
      target: this.props.target,
      endpoint: {
        lat: item.geometry.coordinates[1],
        lon: item.geometry.coordinates[0],
        address: name,
      },
      router: this.context.router,
    });
  };

  render = () =>
    <DTOldSearchSavingAutosuggest
      autoFocus={this.props.autoFocus}
      placeholder="Kirjoita"
      searchType={this.props.searchType}
      onSelect={this.onSuggestionSelected}
    />;
}

export default DTAutosuggestContainer;
