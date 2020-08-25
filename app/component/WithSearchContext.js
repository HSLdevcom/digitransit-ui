/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import PropTypes from 'prop-types';
import { matchShape, routerShape } from 'found';
import { intlShape } from 'react-intl';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { navigateTo } from '../util/path';
import searchContext from '../util/searchContext';
import intializeSearchContext from '../util/DTSearchContextInitializer';

export default function withSearchContext(WrappedComponent) {
  class ComponentWithSearchContext extends React.Component {
    static contextTypes = {
      config: PropTypes.object.isRequired,
      intl: intlShape.isRequired,
      executeAction: PropTypes.func.isRequired,
      getStore: PropTypes.func.isRequired,
      router: routerShape.isRequired,
      match: matchShape.isRequired,
    };

    static propTypes = {
      origin: PropTypes.object,
      destination: PropTypes.object,
      children: PropTypes.node,
      onFavouriteSelected: PropTypes.func,
      itineraryParams: PropTypes.object,
      locationState: PropTypes.object,
    };

    constructor(props) {
      super(props);
      this.state = {
        // eslint-disable-next-line react/no-unused-state
        pendingCurrentLocation: false,
        isInitialized: false,
        positioningSelectedFrom: '',
      };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
      if (prevState.isInitialized) {
        const locState = nextProps.locationState;
        if (
          (prevState.pendingCurrentLocation &&
            locState.status === 'found-address') ||
          locState.locationingFailed
        ) {
          return {
            pendingCurrentLocation: false,
            positioningSelectedFrom: null,
          };
        }
      }
      return null;
    }

    componentDidMount() {
      this.initContext();
    }

    componentDidUpdate(prevProps, prevState) {
      const locState = this.props.locationState;
      if (
        prevState.pendingCurrentLocation !== this.state.pendingCurrentLocation
      ) {
        if (locState.status === 'found-address') {
          const location = {
            type: 'CurrentLocation',
            lat: locState.lat,
            lon: locState.lon,
            gid: locState.gid,
            name: locState.name,
            layer: locState.layer,
            address:
              locState.address ||
              this.context.intl.formatMessage({
                id: 'own-position',
                defaultMessage: 'Own Location',
              }),
          };
          if (prevState.positioningSelectedFrom === 'favourite') {
            this.selectFavourite(location);
          } else {
            this.selectLocation(location, prevState.positioningSelectedFrom);
          }
        }
      }
    }

    initContext() {
      if (!this.state.isInitialized) {
        intializeSearchContext(this.context, searchContext);
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
    };

    onSuggestionSelected = (item, id) => {
      if (!id) {
        return;
      }
      // route
      if (item.properties && item.properties.link) {
        this.selectRoute(item.properties.link);
        return;
      }
      if (id === 'stop-route-station') {
        this.selectStopStation(item);
        return;
      }
      // favourite
      if (id === 'favourite') {
        this.selectFavourite(item);
        return;
      }
      const location = suggestionToLocation(item);
      if (
        item.properties &&
        item.properties.layer === 'currentPosition' &&
        !item.properties.lat
      ) {
        // eslint-disable-next-line react/no-unused-state
        this.setState(
          { pendingCurrentLocation: true, positioningSelectedFrom: id },
          this.context.executeAction(searchContext.startLocationWatch),
        );
      } else {
        this.selectLocation(location, id, this.props.itineraryParams);
      }
    };

    selectRoute(link) {
      this.context.router.push(link);
    }

    selectStopStation = item => {
      // DT-3577 Favourite's doesn't have id property, use gtfsId instead
      let id = item.properties.id ? item.properties.id : item.properties.gtfsId;
      id = id.replace('GTFS:', '').replace(':', '%3A');
      let path = '/pysakit/';
      switch (item.properties.layer) {
        case 'station':
        case 'favouriteStation':
          path = '/terminaalit/';
          break;
        default:
      }
      const link = path.concat(id);
      this.context.router.push(link);
    };

    // eslint-disable-next-line no-unused-vars
    selectFavourite = item => {
      if (
        item.properties &&
        item.properties.layer === 'currentPosition' &&
        !item.properties.lat
      ) {
        this.setState(
          {
            pendingCurrentLocation: true,
            positioningSelectedFrom: 'favourite',
          },
          () => this.context.executeAction(searchContext.startLocationWatch),
        );
      } else {
        this.props.onFavouriteSelected(item);
      }
    };

    selectLocation = (location, id) => {
      const locationWithItineraryParams = this.addItineraryParamsToLocation(
        location,
        this.props.itineraryParams,
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
        if (location.type === 'SelectFromMap') {
          origin = {
            ...location,
            ready: !!location.lat,
          };
        }
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
        if (location.type === 'SelectFromMap') {
          destination = {
            ...location,
            ready: !!location.lat,
          };
        }
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
      } else if (id === 'favourite') {
        return;
      }

      navigateTo({
        base: locationWithItineraryParams,
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
        }).then(res => {
          const newItem = { ...item };
          if (res.features != null && res.features.length > 0) {
            // update only position. It is surprising if, say, the name changes at selection.
            const geom = res.features[0].geometry;
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

    addItineraryParamsToLocation = (location, itineraryParams) => {
      const query = (location && location.query) || {};
      const params = {};
      if (itineraryParams) {
        if (
          itineraryParams.intermediatePlaces &&
          itineraryParams.intermediatePlaces.length > 0
        ) {
          params.intermediatePlaces = itineraryParams.intermediatePlaces;
        }
        params.arriveBy = itineraryParams.arriveBy;
        params.time = itineraryParams.time;
        return {
          ...location,
          query: {
            ...query,
            ...params,
          },
        };
      }
      return { ...location, query };
    };

    render() {
      return (
        <WrappedComponent
          searchContext={searchContext}
          addAnalyticsEvent={addAnalyticsEvent}
          onSelect={this.onSelect}
          {...this.props}
        />
      );
    }
  }
  const componentWithPosition = connectToStores(
    ComponentWithSearchContext,
    ['PositionStore'],
    context => ({
      locationState: context.getStore('PositionStore').getLocationState(),
    }),
  );
  return componentWithPosition;
}
