/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import PropTypes from 'prop-types';
import { matchShape, routerShape } from 'found';
import { intlShape } from 'react-intl';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { createUrl } from '@digitransit-store/digitransit-store-future-route';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  PREFIX_NEARYOU,
  PREFIX_ITINERARY_SUMMARY,
  PREFIX_BIKESTATIONS,
  PREFIX_STOPS,
  PREFIX_TERMINALS,
  PREFIX_ROUTES,
} from '../util/path';
import searchContext from '../util/searchContext';
import intializeSearchContext from '../util/DTSearchContextInitializer';
import SelectFromMapHeader from './SelectFromMapHeader';
import SelectFromMapPageMap from './map/SelectFromMapPageMap';
import DTModal from './DTModal';
import { addressToItinerarySearch } from '../util/otpStrings';

const PATH_OPTS = {
  stopsPrefix: PREFIX_STOPS,
  routesPrefix: PREFIX_ROUTES,
  itinerarySummaryPrefix: PREFIX_ITINERARY_SUMMARY,
};

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
      locationState: PropTypes.object,
      mode: PropTypes.string,
      fromMap: PropTypes.string,
    };

    constructor(props) {
      super(props);
      this.state = {
        // eslint-disable-next-line react/no-unused-state
        pendingCurrentLocation: false,
        isInitialized: false,
        positioningSelectedFrom: '',
        fromMap: this.props.fromMap,
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

    finishSelect = (item, type, id) => {
      if (
        item.type.indexOf('Favourite') === -1 &&
        id.indexOf('favourite') === -1 &&
        item.properties &&
        item.properties.layer &&
        item.properties.layer.indexOf('favourite') === -1
      ) {
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
      // future route
      if (item.type === 'FutureRoute') {
        this.selectFutureRoute(item);
        return;
      }
      // route
      if (item.properties && item.properties.link) {
        this.selectRoute(item.properties.link);
        return;
      }
      if (id === 'origin-stop-near-you') {
        this.selectStopNearYou(item);
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
        this.selectLocation(location, id);
      }
    };

    selectRoute(link) {
      this.context.router.push(link);
    }

    selectStopStation = item => {
      // DT-3577 Favourite's doesn't have id property, use gtfsId instead
      let id = item.properties.id ? item.properties.id : item.properties.gtfsId;

      let path;
      switch (item.properties.layer) {
        case 'station':
        case 'favouriteStation':
          path = `/${PREFIX_TERMINALS}/`;
          id = id.replace('GTFS:', '').replace(':', '%3A');
          break;
        case 'bikeRentalStation':
        case 'favouriteBikeRentalStation':
          path = `/${PREFIX_BIKESTATIONS}/`;
          id = item.properties.labelId;
          break;
        default:
          path = `/${PREFIX_STOPS}/`;
          id = id.replace('GTFS:', '').replace(':', '%3A');
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
      if (!location) {
        return;
      }
      addAnalyticsEvent({
        action: 'EditJourneyEndPoint',
        category: 'ItinerarySettings',
        name: location.type,
      });
      /*      let origin;
      let destination;
      if (id === 'origin' && location.type !== 'SelectFromMap') {
      } else if (id === 'destination' && location.type !== 'SelectFromMap') {
      } else if (id === 'favourite') {
        return;
      }
*/
      if (location.type === 'SelectFromMap') {
        this.setState({ fromMap: id });
      }
    };

    selectFutureRoute = item => {
      const path = createUrl(item);
      this.context.router.push(path);
    };

    selectStopNearYou = item => {
      const location = suggestionToLocation(item);
      let path = `/${PREFIX_NEARYOU}/${
        this.props.mode
      }/${addressToItinerarySearch(location)}`;
      if (this.context.match.location.search) {
        path += this.context.match.location.search;
      }
      this.context.router.replace(path);
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
          this.finishSelect(newItem, type, id);
          this.onSuggestionSelected(item, id);
        });
      } else {
        this.finishSelect(item, type, id);
        this.onSuggestionSelected(item, id);
      }
    };

    confirmMapSelection = (type, mapLocation) => {
      this.setState({ fromMap: undefined });
      this.selectLocation(mapLocation, type);
    };

    renderSelectFromMapModal = id => {
      let titleId = 'select-from-map-no-title';

      if (id === 'origin') {
        titleId = 'select-from-map-origin';
      }

      if (id === 'destination') {
        titleId = 'select-from-map-destination';
      }

      return (
        <DTModal show>
          <SelectFromMapHeader
            titleId={titleId}
            onBackBtnClick={() => this.setState({ fromMap: undefined })}
          />
          <SelectFromMapPageMap
            type={id}
            onConfirm={this.confirmMapSelection}
          />
        </DTModal>
      );
    };

    render() {
      const { fromMap } = this.state;

      if (fromMap) {
        return this.renderSelectFromMapModal(fromMap);
      }

      return (
        <WrappedComponent
          appElement="#app"
          searchContext={searchContext}
          addAnalyticsEvent={addAnalyticsEvent}
          onSelect={this.onSelect}
          {...this.props}
          pathOpts={PATH_OPTS}
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
