import React from 'react';
import PropTypes from 'prop-types';
import { routerShape } from 'react-router';
import DTSearchAutosuggest from './DTSearchAutosuggest';
import { saveSearch } from '../action/SearchActions';
import { dtLocationShape } from '../util/shapes';
import { getJson } from '../util/xhrPromise';

class DTOldSearchSavingAutosuggest extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
  };

  static propTypes = {
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    icon: PropTypes.string,
    id: PropTypes.string.isRequired,
    isFocused: PropTypes.func,
    layers: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    refPoint: dtLocationShape.isRequired,
    searchType: PropTypes.string.isRequired,
    value: PropTypes.string,
  };

  static defaultProps = {
    autoFocus: false,
    icon: undefined,
    className: '',
    placeholder: '',
  };

  finishSelect = (item, type) => {
    this.context.executeAction(saveSearch, { item, type });
    this.props.onSelect(item, type);
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

    if (item.type === 'OldSearch' && item.properties.gid) {
      getJson(this.context.config.URL.PELIAS_PLACE, {
        ids: item.properties.gid,
      }).then(data => {
        const newItem = { ...item };
        if (data.features != null && data.features.length > 0) {
          // update only position. It is surprising if, say, the name changes at selection.
          const geom = data.features[0].geometry;
          newItem.geometry.coordinates = geom.coordinates;
        }
        this.finishSelect(newItem, type);
      });
    } else {
      this.finishSelect(item, type);
    }
  };

  render = () => {
    const {
      autoFocus,
      className,
      icon,
      id,
      isFocused,
      layers,
      placeholder,
      refPoint,
      searchType,
      value,
    } = this.props;
    return (
      <DTSearchAutosuggest
        autoFocus={autoFocus}
        className={className}
        icon={icon}
        id={id}
        isFocused={isFocused}
        layers={layers}
        placeholder={placeholder}
        refPoint={refPoint}
        searchType={searchType}
        selectedFunction={suggestion => this.onSelect(suggestion)}
        value={value}
      />
    );
  };
}

export default DTOldSearchSavingAutosuggest;
