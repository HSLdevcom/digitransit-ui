import React from 'react';
import PropTypes from 'prop-types';
import { routerShape } from 'react-router';
import DTSearchAutosuggest from './DTSearchAutosuggest';
import { saveSearch } from '../action/SearchActions';

class DTOldSearchSavingAutosuggest extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
  };

  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    searchType: PropTypes.string.isRequired,
    autoFocus: PropTypes.bool,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string.isRequired,
    renderPostInput: PropTypes.node,
    isFocused: PropTypes.func,
  };

  static defaultProps = {
    autoFocus: false,
    placeholder: '',
    className: '',
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

  render = () => (
    <DTSearchAutosuggest
      autoFocus={this.props.autoFocus}
      placeholder={this.props.placeholder}
      isFocused={this.props.isFocused}
      searchType={this.props.searchType}
      value={this.props.value}
      selectedFunction={(event, { suggestion }) => {
        this.onSelect(suggestion);
      }}
      id={this.props.id}
      className={this.props.className}
      renderPostInput={this.props.renderPostInput}
    />
  );
}

export default DTOldSearchSavingAutosuggest;
