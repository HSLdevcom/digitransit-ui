import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { routerShape } from 'react-router';
import DTOldSearchSavingAutosuggest from './DTOldSearchSavingAutosuggest';
import { getLabel, getGTFSId, isStop } from '../util/suggestionUtils';
import { dtLocationShape } from '../util/shapes';

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
    renderPostInput: PropTypes.node,
    isFocused: PropTypes.func,
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
      const url = `/pysakit/${getGTFSId(clone.properties)}`;
      this.context.router.push(url);
      return;
    }

    const location = {
      address: name,
      type: item.type,
      lat:
        item.geometry &&
        item.geometry.coordinates &&
        item.geometry.coordinates[1],
      lon:
        item.geometry &&
        item.geometry.coordinates &&
        item.geometry.coordinates[0],
    };

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
      className={this.props.value !== '' ? this.props.className : ''}
      renderPostInput={this.props.renderPostInput}
    />
  );
}

export default DTEndpointAutosuggest;
