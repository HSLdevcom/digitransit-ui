/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import PropTypes from 'prop-types';
import { matchShape, routerShape } from 'found';
import { intlShape } from 'react-intl';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import { withCurrentTime } from '../util/DTSearchUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { navigateTo } from '../util/path';
import { dtLocationShape } from '../util/shapes';
import searchContext from '../util/searchContext';
import intializeSearchContext from '../util/DTSearchContextInitializer';
import getRelayEnvironment from '../util/getRelayEnvironment';

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
    relayEnvironment: PropTypes.object.isRequired,
    lang: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      // eslint-disable-next-line react/no-unused-state
      pendingCurrentLocation: false,
      isInitialized: false,
    };
  }

  componentDidMount() {
    this.initContext();
  }

  initContext() {
    if (!this.state.isInitialized) {
      intializeSearchContext(
        this.context,
        searchContext,
        this.props.relayEnvironment,
      );
      this.setState({ isInitialized: true });
    }
  }

  storeReference = ref => {
    this.setState(prevState => ({ refs: [...prevState.refs, ref] }));
  };

  finishSelect = (item, type) => {
    if (item.type.indexOf('Favourite') === -1) {
      this.context.executeAction(searchContext.saveSearch, {
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
    if (id === 'stop-route-station') {
      this.selectStopStation(item);
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
        this.context.executeAction(searchContext.startLocationWatch),
      );
    } else {
      this.selectLocation(location, id);
    }
  };

  selectRoute(link) {
    this.context.router.push(link);
  }

  selectStopStation = item => {
    const id = item.properties.id.replace('GTFS:', '').replace(':', '%3A');
    let path = 'pysakit/';
    switch (item.properties.layer) {
      case 'station':
        path = 'terminaalit/';
        break;
      default:
    }
    const link = path.concat(id);

    this.context.router.push(link);
  };

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
    if (item.type === 'CurrentLocation') {
      // item is already a location.
      this.selectLocation(item, id);
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
    // TODO: This should be defined in upper level
    const geocodingLayers = ['station', 'venue', 'address'];
    return (
      <DTAutosuggestPanel
        config={this.context.config}
        searchPanelText={this.props.searchPanelText}
        origin={this.props.origin}
        onSelect={this.onSelect}
        destination={this.props.destination}
        isItinerary={this.props.isItinerary}
        searchType={this.props.searchType}
        originPlaceHolder={this.props.originPlaceHolder}
        destinationPlaceHolder={this.props.destinationPlaceHolder}
        searchContext={searchContext}
        initialViaPoints={this.props.initialViaPoints}
        updateViaPoints={this.props.updateViaPoints}
        swapOrder={this.props.swapOrder}
        addAnalyticsEvent={addAnalyticsEvent}
        lang={this.props.lang}
        geocodingLayers={geocodingLayers}
      />
    );
  }

  renderAutoSuggest() {
    // TODO: This should be defined in upper level
    const geocodingLayers = ['stop', 'station'];
    return (
      <DTAutoSuggest
        config={this.context.config}
        icon={this.props.icon}
        id={this.props.id}
        autoFocus={this.props.autoFocus}
        refPoint={this.props.refPoint}
        className={this.props.className}
        searchType={this.props.searchType}
        placeholder={this.props.placeholder}
        value={this.props.value}
        onSelect={this.onSelect}
        isFocused={this.isFocused}
        onRouteSelected={this.props.onRouteSelected}
        searchContext={searchContext}
        showSpinner={this.props.showSpinner}
        layers={this.props.layers}
        lang={this.props.lang}
        geocodingLayers={geocodingLayers}
      />
    );
  }

  render() {
    return this.props.type === 'panel'
      ? this.renderPanel()
      : this.renderAutoSuggest();
  }
}

export default getRelayEnvironment(DTAutosuggestContainer);
