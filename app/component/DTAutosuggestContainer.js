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
    origin: dtLocationShape,
    destination: dtLocationShape,
    getViaPointsFromMap: PropTypes.bool,
    locationState: PropTypes.object,
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
    isItinerary: PropTypes.bool,
    initialViaPoints: PropTypes.array,
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
      this.selectRoute(item.properties.link);
      return;
    }
    // favourite
    if (id === 'favourite') {
      this.selectFavourite(item, id);
      return;
    }
    const location = suggestionToLocation(item);
    if (item.properties.layer === 'currentPosition' && !item.properties.lat) {
      // eslint-disable-next-line react/no-unused-state
      this.setState({ pendingCurrentLocation: true }, () =>
        this.context.executeAction(this.props.searchContext.startLocationWatch),
      );
    } else {
      this.selectLocation(location, id);
    }
  };

  selectRoute(link) {
    this.context.router.push(link);
  }
  // eslint-disable-next-line no-unused-vars
  selectFavourite = (item, id) => {
    // TODO Do what is needed  }
  };

  selectLocation = (location, id) => {
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.match.location,
    );
    addAnalyticsEvent({
      action: 'EditJourneyEndPoint',
      category: 'ItinerarySettings',
      name: location.type,
    });
    let origin;
    let destination;

    if (id === 'origin') {
      origin = { ...location, ready: true };
      // eslint-disable-next-line prefer-destructuring
      destination = this.props.destination;
      if (location.type === 'CurrentLocation') {
        origin = { ...location, gps: true, ready: !!location.lat };
        if (destination.gps === true) {
          // destination has gps, clear destination
          destination = { set: false };
        }
      }
      if (!destination || !destination.set) {
        this.state.refs[1].focus();
      }
    } else if (id === 'destination') {
      // eslint-disable-next-line prefer-destructuring
      origin = this.props.origin;
      destination = { ...location, ready: true };
      if (location.type === 'CurrentLocation') {
        destination = {
          ...location,
          gps: true,
          ready: !!location.lat,
        };
        if (origin.gps === true) {
          origin = { set: false };
        }
      }
    }

    navigateTo({
      base: locationWithTime,
      origin,
      destination,
      context: '', // PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
      resetIndex: true,
    });
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
    if (id === 'CurrentLocation') {
      // item is already a location.
      this.selectLocation(item);
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
