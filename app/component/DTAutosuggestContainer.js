import React from 'react';
import PropTypes from 'prop-types';
import { matchShape, routerShape } from 'found';
import { intlShape } from 'react-intl';
import { suggestionToLocation } from '../util/suggestionUtils';
import { getJson } from '../util/xhrPromise';
import { withCurrentTime } from '../util/searchUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { navigateTo } from '../util/path';
import DTAutoSuggest from './DTAutosuggest';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { dtLocationShape } from '../util/shapes';

class DTAutosuggestContainer extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
  };

  static propTypes = {
    type: PropTypes.string.isRequired,
    searchPanelText: PropTypes.string,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    getViaPointsFromMap: PropTypes.bool.isRequired,
    locationState: PropTypes.object.isRequired,
    searchContext: PropTypes.object.isRequired,
    searchType: PropTypes.string,
    originPlaceHolder: PropTypes.string,
    destinationPlaceHolder: PropTypes.string,
    icon: PropTypes.string,
    id: PropTypes.string,
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onLocationSelected: PropTypes.func,
    isItinerary: PropTypes.bool,
    initialViaPoints: PropTypes.func,
    updateViaPoints: PropTypes.func,
    swapOrder: PropTypes.func,
    refPoint: PropTypes.object,
    onRouteSelected: PropTypes.func,
    showSpinner: PropTypes.bool,
    layers: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      // eslint-disable-next-line react/no-unused-state
      pendingCurrentLocation: false,
      refs: [],
    };
  }

  storeReference = ref => {
    this.setState(prevState => ({ refs: [...prevState.refs, ref] }));
  };

  onOriginSelected = location => {
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.match.location,
    );
    addAnalyticsEvent({
      action: 'EditJourneyStartPoint',
      category: 'ItinerarySettings',
      name: location.type,
    });
    let newOrigin = { ...location, ready: true };
    let { destination } = this.props;
    if (location.type === 'CurrentLocation') {
      newOrigin = { ...location, gps: true, ready: !!location.lat };
      if (destination.gps === true) {
        // destination has gps, clear destination
        destination = { set: false };
      }
    }
    if (!destination || !destination.set) {
      this.state.refs[1].focus();
    }
    navigateTo({
      base: locationWithTime,
      origin: newOrigin,
      destination,
      context: '', // PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
      resetIndex: true,
    });
  };

  onDestinationSelected = location => {
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.match.location,
    );
    addAnalyticsEvent({
      action: 'EditJourneyEndPoint',
      category: 'ItinerarySettings',
      name: location.type,
    });

    let updatedOrigin = this.props.origin;
    let destination = { ...location, ready: true };
    if (location.type === 'CurrentLocation') {
      destination = {
        ...location,
        gps: true,
        ready: !!location.lat,
      };
      if (origin.gps === true) {
        updatedOrigin = { set: false };
      }
    }

    navigateTo({
      base: locationWithTime,
      origin: updatedOrigin,
      destination,
      context: '', // PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
      resetIndex: true,
    });
  };

  finishSelect = (item, type) => {
    if (item.type.indexOf('Favourite') === -1) {
      this.context.executeAction(this.props.searchContext.saveSearch, {
        item,
        type,
      });
    }
    // this.onSelect(item, type);
  };

  onSuggestionSelected = (item, id) => {
    // route
    if (item.properties.link) {
      this.context.router.push(item.properties.link);
      return;
    }
    const location = suggestionToLocation(item);
    if (item.properties.layer === 'currentPosition' && !item.properties.lat) {
      // eslint-disable-next-line react/no-unused-state
      this.setState({ pendingCurrentLocation: true }, () =>
        this.context.executeAction(this.props.searchContext.startLocationWatch),
      );
    } else {
      this.onLocationSelected(location, id);
    }
  };

  onLocationSelected = (location, id) => {
    if (this.props.onLocationSelected) {
      // If onLocationSelected is spesified by parent component,
      // then this is not needed
      return;
    }
    switch (id) {
      case 'origin':
        this.onOriginSelected(location);
        break;
      case 'destination':
        this.onDestinationSelected(location);
        break;
      default:
        this.onOriginSelected(location);
    }
  };

  onSelect = (item, id) => {
    // type is destination unless timetable or route was clicked
    let type = 'endpoint';
    switch (item.type) {
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
        this.onSuggestionSelected(item, id);
      });
    } else {
      this.finishSelect(item, type);
      this.onSuggestionSelected(item, id);
    }
  };

  renderPanel() {
    return (
      <DTAutosuggestPanel
        searchPanelText={this.props.searchPanelText}
        origin={this.props.origin}
        onSelect={this.onSelect}
        destination={this.props.destination}
        refs={this.state.refs}
        isItinerary={this.props.isItinerary}
        storeRef={this.storeReference}
        searchType={this.props.searchType}
        originPlaceHolder={this.props.originPlaceHolder}
        destinationPlaceHolder={this.props.destinationPlaceHolder}
        searchContext={this.props.searchContext}
        locationState={this.props.locationState}
        onOriginSelected={this.onOriginSelected}
        nationSelected={this.onDestinationSelected}
        initialViaPoints={this.props.initialViaPoints}
        updateViaPoints={this.props.updateViaPoints}
        swapOrder={this.props.swapOrder}
        getViaPointsFromMap={this.props.getViaPointsFromMap}
      />
    );
  }

  renderAutoSuggest() {
    return (
      <DTAutoSuggest
        icon={this.props.icon}
        id={this.props.id}
        autoFocus={this.props.autoFocus}
        storeRef={this.storeReference}
        refPoint={this.props.refPoint}
        className={this.props.className}
        searchType={this.props.searchType}
        placeholder={this.props.placeholder}
        value={this.props.value}
        onSelect={this.onSelect}
        isFocused={this.isFocused}
        onLocationSelected={this.props.onLocationSelected}
        onRouteSelected={this.props.onRouteSelected}
        searchContext={this.props.searchContext}
        locationState={this.props.locationState}
        showSpinner={this.props.showSpinner}
        layers={this.props.layers}
      />
    );
  }

  render() {
    return this.props.type === 'panel'
      ? this.renderPanel()
      : this.renderAutoSuggest();
  }
}

export default DTAutosuggestContainer;
