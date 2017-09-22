import React from 'react';
import PropTypes from 'prop-types';
import DTSearchAutosuggest from './DTSearchAutosuggest';
import { saveSearch } from '../action/SearchActions';

class DTOldSearchSavingAutosuggest extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    searchType: PropTypes.string.isRequired,
    autoFocus: PropTypes.bool,
    placeHolder: PropTypes.string,
  };

  static defaultProps = {
    autoFocus: false,
    placeHolder: '',
  };

  onSelect = item => {
    // type is destination unless timetable or route was clicked
    let type = 'endpoint';
    switch (item.type) {
      case 'Stop': // stop can be timetable or
        if (item.timetableClicked === true) {
          type = 'search';
        }
        break;
      case 'Route':
        type = 'search';
        break;
      default:
    }

    this.context.executeAction(saveSearch, { item, type });
    this.props.onSelect(item, type);
  };

  render = () =>
    <DTSearchAutosuggest
      autoFocus={this.props.autoFocus}
      placeholder="Kirjoita"
      searchType={this.props.searchType}
      selectedFunction={(event, { suggestion }) => {
        this.onSelect(suggestion);
      }}
    />;
}

export default DTOldSearchSavingAutosuggest;
