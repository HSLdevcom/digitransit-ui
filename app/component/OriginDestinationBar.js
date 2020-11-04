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
    location: PropTypes.object,
    language: PropTypes.string,
    isMobile: PropTypes.bool,
    showFavourites: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    getStore: PropTypes.func.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static defaultProps = {
    className: undefined,
    location: undefined,
    language: 'fi',
    isMobile: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      viaPoints: [],
    };
  }

  get location() {
    return this.props.location || this.context.match.location;
  }

  updateViaPoints = newViaPoints => {
    this.setState({ viaPoints: newViaPoints }, () => {
      return setIntermediatePlaces(
        this.context.router,
        this.context.match,
        newViaPoints.map(locationToOtp),
      );
    });
  };

  openSelectFromMapModal = () => {
    this.setState({
      showModal: true,
    });
  };

  closeSelectFromMapModal = () => {
    this.setState({
      showModal: false,
    });
  };

  renderSelectFromMapModal = () => {
    const titleId = 'select-from-map-viaPoint';
    return (
      <DTModal show={this.state.showModal}>
        <SelectFromMapHeader
          titleId={titleId}
          onBackBtnClick={this.closeSelectFromMapModal}
        />
        <SelectFromMapPageMap
          type="viaPoint"
          onConfirm={this.confirmMapSelection}
        />
      </DTModal>
    );
  };

  confirmMapSelection = (type, mapLocation) => {
    const { viaPoints } = this.state;
    const points = viaPoints.filter(vp => !isEmpty(vp));
    points.push(mapLocation);
    this.setState(
      {
        showModal: false,
        viaPoints: points,
      },
      () => {
        this.updateViaPoints(this.state.viaPoints);
      },
    );
  };

  handleViaPointLocationSelected = (viaPointLocation, i) => {
    if (addAnalyticsEvent) {
      addAnalyticsEvent({
        action: 'EditJourneyViaPoint',
        category: 'ItinerarySettings',
        name: viaPointLocation.type,
      });
    }
    if (viaPointLocation.type !== 'SelectFromMap') {
      const { viaPoints } = this.state;
      let points = viaPoints;
      points[i] = {
        ...viaPointLocation,
      };
      points = points.filter(vp => !isEmpty(vp));
      this.setState({ viaPoints: points }, () => this.updateViaPoints(points));
    } else {
      this.setState({ showModal: true });
    }
  };

  swapEndpoints = () => {
    const { location } = this;
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
          viaPoints={
            this.state.viaPoints.length > 0
              ? this.state.viaPoints
              : getIntermediatePlaces(
                  this.props.location
                    ? this.props.location.query
                    : this.context.match.location.query,
                )
          }
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
          ]}
          lang={this.props.language}
          disableAutoFocus={this.props.isMobile}
          isMobile={this.props.isMobile}
          itineraryParams={this.context.match.location.query}
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
  ['PreferencesStore', 'FavouriteStore'],
  ({ getStore }) => ({
    language: getStore('PreferencesStore').getLanguage(),
    showFavourites: getStore('FavouriteStore').getStatus() === 'has-data',
  }),
);

export { connectedComponent as default, OriginDestinationBar as Component };
