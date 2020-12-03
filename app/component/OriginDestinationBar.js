import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import { isEmpty } from 'lodash';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import ComponentUsageExample from './ComponentUsageExample';
import { PREFIX_ITINERARY_SUMMARY, navigateTo } from '../util/path';
import withSearchContext from './WithSearchContext';
import SelectFromMapHeader from './SelectFromMapHeader';
import SelectFromMapPageMap from './map/SelectFromMapPageMap';
import DTModal from './DTModal';
import { setIntermediatePlaces } from '../util/queryUtils';
import { getIntermediatePlaces } from '../util/otpStrings';
import { dtLocationShape } from '../util/shapes';
import { setViaPoints } from '../action/ViaPointActions';
import { LightenDarkenColor } from '../util/colorUtils';

const DTAutosuggestPanelWithSearchContext = withSearchContext(
  DTAutosuggestPanel,
);

const locationToOtp = location =>
  `${location.address}::${location.lat},${location.lon}${
    location.locationSlack ? `::${location.locationSlack}` : ''
  }`;

class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    destination: dtLocationShape,
    origin: dtLocationShape,
    language: PropTypes.string,
    isMobile: PropTypes.bool,
    showFavourites: PropTypes.bool.isRequired,
    viaPoints: PropTypes.array,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static defaultProps = {
    className: undefined,
    language: 'fi',
    isMobile: false,
    viaPoints: [],
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const viaPoints = getIntermediatePlaces(this.context.match.location.query);
    this.context.executeAction(setViaPoints, viaPoints);
  }

  componentWillUnmount() {
    // fixes the bug that DTPanel starts excecuting updateViaPoints before this component is even mounted
    this.context.executeAction(setViaPoints, []);
  }

  updateViaPoints = newViaPoints => {
    this.context.executeAction(setViaPoints, newViaPoints);
    const p = newViaPoints.filter(vp => !isEmpty(vp));
    setIntermediatePlaces(
      this.context.router,
      this.context.match,
      p.map(locationToOtp),
    );
  };

  renderSelectFromMapModal = () => {
    const titleId = 'select-from-map-viaPoint';
    return (
      <DTModal show={this.state.mapSelectionIndex !== undefined}>
        <SelectFromMapHeader
          titleId={titleId}
          onBackBtnClick={() => this.setState({ mapSelectionIndex: undefined })}
        />
        <SelectFromMapPageMap
          type="viaPoint"
          onConfirm={this.confirmMapSelection}
        />
      </DTModal>
    );
  };

  confirmMapSelection = (type, mapLocation) => {
    const viaPoints = [...this.props.viaPoints];
    viaPoints[this.state.mapSelectionIndex] = mapLocation;
    this.updateViaPoints(viaPoints);
    this.setState({ mapSelectionIndex: undefined });
  };

  handleViaPointLocationSelected = (viaPointLocation, i) => {
    addAnalyticsEvent({
      action: 'EditJourneyViaPoint',
      category: 'ItinerarySettings',
      name: viaPointLocation.type,
    });
    if (viaPointLocation.type !== 'SelectFromMap') {
      const points = [...this.props.viaPoints];
      points[i] = {
        ...viaPointLocation,
      };
      this.updateViaPoints(points);
    } else {
      this.setState({ mapSelectionIndex: i });
    }
  };

  filterMobileFavouriteStops = (results, type) => {
    const filteredResults = results.filter(
      res => !res.properties.layer.includes('favourite'),
    );
    return type === 'Stops' ? filteredResults : results;
  };

  swapEndpoints = () => {
    const { location } = this.context.match;
    const intermediatePlaces = getIntermediatePlaces(location.query);
    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }
    navigateTo({
      base: location,
      origin: this.props.destination,
      destination: this.props.origin,
      rootPath: PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
      resetIndex: true,
    });
  };

  render() {
    return (
      <div
        className={cx(
          'origin-destination-bar',
          this.props.className,
          'flex-horizontal',
        )}
      >
        <DTAutosuggestPanelWithSearchContext
          appElement="#app"
          origin={this.props.origin}
          destination={this.props.destination}
          originPlaceHolder="search-origin-index"
          destinationPlaceHolder="search-destination-index"
          showMultiPointControls
          viaPoints={this.props.viaPoints}
          handleViaPointLocationSelected={this.handleViaPointLocationSelected}
          addAnalyticsEvent={addAnalyticsEvent}
          updateViaPoints={this.updateViaPoints}
          swapOrder={this.swapEndpoints}
          sources={[
            'History',
            'Datasource',
            this.props.isMobile && this.props.showFavourites ? 'Favourite' : '',
          ]}
          targets={[
            'Locations',
            'CurrentPosition',
            !this.props.isMobile && this.props.showFavourites
              ? 'SelectFromOwnLocations'
              : '',
            this.props.isMobile ? 'MapPosition' : '',
            'Stops',
          ]}
          filterResults={this.filterMobileFavouriteStops}
          lang={this.props.language}
          disableAutoFocus={this.props.isMobile}
          isMobile={this.props.isMobile}
          itineraryParams={this.context.match.location.query}
          color={this.context.config.colors.primary}
          hoverColor={
            this.context.config.colors.hover ||
            LightenDarkenColor(this.context.config.colors.primary, -20)
          }
        />{' '}
        {this.renderSelectFromMapModal()}
      </div>
    );
  }
}

OriginDestinationBar.description = (
  <React.Fragment>
    <ComponentUsageExample>
      <OriginDestinationBar
        destination={{ ready: false, set: false }}
        origin={{
          address: 'Messukeskus, Itä-Pasila, Helsinki',
          lat: 60.201415,
          lon: 24.936696,
          ready: true,
          set: true,
        }}
        showFavourites
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="with-viapoint">
      <OriginDestinationBar
        destination={{ ready: false, set: false }}
        location={{
          query: {
            intermediatePlaces: 'Opastinsilta 6, Helsinki::60.199093,24.940536',
          },
        }}
        origin={{
          address: 'Messukeskus, Itä-Pasila, Helsinki',
          lat: 60.201415,
          lon: 24.936696,
          ready: true,
          set: true,
        }}
        showFavourites
      />
    </ComponentUsageExample>
  </React.Fragment>
);

const connectedComponent = connectToStores(
  OriginDestinationBar,
  ['PreferencesStore', 'FavouriteStore', 'ViaPointStore'],
  ({ getStore }) => ({
    language: getStore('PreferencesStore').getLanguage(),
    showFavourites: getStore('FavouriteStore').getStatus() === 'has-data',
    viaPoints: getStore('ViaPointStore').getViaPoints(),
  }),
);

export { connectedComponent as default, OriginDestinationBar as Component };
