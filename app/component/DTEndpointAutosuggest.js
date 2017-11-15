import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { routerShape } from 'react-router';
import DTOldSearchSavingAutosuggest from './DTOldSearchSavingAutosuggest';
import {
  suggestionToLocation,
  getGTFSId,
  isStop,
} from '../util/suggestionUtils';
import { dtLocationShape } from '../util/shapes';
import { getAllEndpointLayers } from '../util/searchUtils';
import { PREFIX_STOPS } from '../util/path';

class DTEndpointAutosuggest extends React.Component {
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
    refPoint: dtLocationShape.isRequired,
    layers: PropTypes.array,
    isFocused: PropTypes.func,
  };

  static defaultProps = {
    autoFocus: false,
    className: '',
    layers: getAllEndpointLayers(),
  };

  constructor() {
    super();

    this.state = {};
  }

  onSuggestionSelected = item => {
    // stop
    if (isStop(get(item, 'properties')) && item.timetableClicked === true) {
      const url = `/${PREFIX_STOPS}/${getGTFSId(item.properties)}`;
      this.context.router.push(url);
      return;
    }

    // route
    if (item.properties.link) {
      this.context.router.push(item.properties.link);
      return;
    }

    const location = suggestionToLocation(item);

    this.props.onLocationSelected(location);
  };

  render = () => (
    <DTOldSearchSavingAutosuggest
      autoFocus={this.props.autoFocus}
      isFocused={this.props.isFocused}
      placeholder={this.props.placeholder}
      searchType={this.props.searchType}
      onSelect={this.onSuggestionSelected}
      refPoint={this.props.refPoint}
      value={this.props.value}
      id={this.props.id}
      layers={this.props.layers}
      className={this.props.value !== '' ? this.props.className : ''}
    />
  );
}

export default DTEndpointAutosuggest;
