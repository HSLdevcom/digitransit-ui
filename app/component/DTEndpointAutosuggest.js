import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'react-router';
import DTOldSearchSavingAutosuggest from './DTOldSearchSavingAutosuggest';
import Loading from './Loading';
import {
  suggestionToLocation,
  getGTFSId,
  isStop,
} from '../util/suggestionUtils';
import { dtLocationShape } from '../util/shapes';
import { getAllEndpointLayers } from '../util/searchUtils';
import { PREFIX_STOPS, PREFIX_TERMINALS } from '../util/path';
import { startLocationWatch } from '../action/PositionActions';
import PositionStore from '../store/PositionStore';

export class DTEndpointAutosuggestComponent extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    intl: intlShape,
  };

  static propTypes = {
    searchType: PropTypes.string.isRequired,
    autoFocus: PropTypes.bool,
    onLocationSelected: PropTypes.func.isRequired,
    onRouteSelected: PropTypes.func,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    icon: PropTypes.string,
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    refPoint: dtLocationShape.isRequired,
    layers: PropTypes.array,
    isFocused: PropTypes.func,
    isPreferredRouteSearch: PropTypes.bool,
    locationState: PropTypes.object.isRequired,
    showSpinner: PropTypes.bool,
    ariaLabel: PropTypes.string,
  };

  static defaultProps = {
    autoFocus: false,
    className: '',
    layers: getAllEndpointLayers(),
    icon: undefined,
    isPreferredRouteSearch: false,
    onRouteSelected: undefined,
    showSpinner: false,
  };

  state = {};

  componentWillReceiveProps = nextProps => {
    const locState = nextProps.locationState;
    // wait until address is set or geolocationing fails
    if (
      this.state.pendingCurrentLocation &&
      (locState.status === PositionStore.STATUS_FOUND_ADDRESS ||
        locState.locationingFailed)
    ) {
      this.setState({ pendingCurrentLocation: false }, () => {
        if (locState.status === PositionStore.STATUS_FOUND_ADDRESS) {
          const location = {
            type: 'CurrentLocation',
            lat: locState.lat,
            lon: locState.lon,
            address:
              locState.address ||
              this.context.intl.formatMessage({
                id: 'own-position',
                defaultMessage: 'Own Location',
              }),
          };
          nextProps.onLocationSelected(location);
        }
      });
    }
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    if (
      this.state.pendingCurrentLocation !== nextState.pendingCurrentLocation
    ) {
      return true;
    }
    let changed;
    Object.keys(nextProps).forEach(key => {
      // shallow compare
      if (key !== 'locationState' && this.props[key] !== nextProps[key]) {
        changed = true;
      }
    });
    if (changed) {
      return true;
    }
    const oldLocState = this.props.locationState;
    const newLocState = nextProps.locationState;
    const oldGeoloc =
      oldLocState.status === PositionStore.STATUS_FOUND_ADDRESS ||
      oldLocState.status === PositionStore.STATUS_FOUND_LOCATION;
    const newGeoloc =
      newLocState.status === PositionStore.STATUS_FOUND_ADDRESS ||
      newLocState.status === PositionStore.STATUS_FOUND_LOCATION;
    if (oldGeoloc && newGeoloc) {
      // changes between found-location / found-address do not count
      return false;
    }
    return oldLocState.status !== newLocState.status;
  };

  onSuggestionSelected = item => {
    // preferred route selection
    if (this.props.isPreferredRouteSearch && this.props.onRouteSelected) {
      this.props.onRouteSelected(item);
      return;
    }
    // stop
    if (item.timetableClicked === true) {
      const prefix = isStop(item.properties) ? PREFIX_STOPS : PREFIX_TERMINALS;

      const url = `/${prefix}/${getGTFSId(item.properties)}`;
      this.context.router.push(url);
      return;
    }

    // route
    if (item.properties.link) {
      this.context.router.push(item.properties.link);
      return;
    }
    const location = suggestionToLocation(item);

    if (item.properties.layer === 'currentPosition' && !item.properties.lat) {
      this.setState({ pendingCurrentLocation: true }, () =>
        this.context.executeAction(startLocationWatch),
      );
    } else {
      this.props.onLocationSelected(location);
    }
  };

  render = () => {
    if (this.props.showSpinner && this.state.pendingCurrentLocation) {
      return <Loading />;
    }
    return (
      <DTOldSearchSavingAutosuggest
        autoFocus={this.props.autoFocus}
        icon={this.props.icon}
        isFocused={this.props.isFocused}
        placeholder={this.props.placeholder}
        searchType={this.props.searchType}
        onSelect={this.onSuggestionSelected}
        refPoint={this.props.refPoint}
        value={this.props.value}
        id={this.props.id}
        layers={this.props.layers}
        className={this.props.className}
        ariaLabel={this.props.ariaLabel}
      />
    );
  };
}

export default connectToStores(
  DTEndpointAutosuggestComponent,
  [PositionStore],
  context => ({
    locationState: context.getStore(PositionStore).getLocationState(),
  }),
);
