import React from 'react';
import PropTypes from 'prop-types';
import DTSearchAutosuggest from './DTSearchAutosuggest';
import { saveSearch } from '../action/SearchActions';
import { dtLocationShape } from '../util/shapes';
import { searchPlace } from '../util/searchUtils';

class DTOldSearchSavingAutosuggest extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
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
    ariaLabel: PropTypes.string,
  };

  static defaultProps = {
    autoFocus: false,
    icon: undefined,
    className: '',
    placeholder: '',
  };

  finishSelect = (item, type) => {
    if (item.type.indexOf('Favourite') === -1) {
      this.context.executeAction(saveSearch, { item, type });
    }
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
      searchPlace(item.properties.gid, this.context.config).then(data => {
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
      ariaLabel,
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
        ariaLabel={ariaLabel}
      />
    );
  };
}

export default DTOldSearchSavingAutosuggest;
