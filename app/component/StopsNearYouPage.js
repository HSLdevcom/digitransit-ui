import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { graphql, ReactRelayContext, QueryRenderer } from 'react-relay';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Modal from '@hsl-fi/modal';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTIcon from '@digitransit-component/digitransit-component-icon';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import Icon from './Icon';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import withBreakpoint, { DesktopOrMobile } from '../util/withBreakpoint';
import { otpToLocation } from '../util/otpStrings';
import Loading from './Loading';
import {
  checkPositioningPermission,
  startLocationWatch,
  showGeolocationDeniedMessage,
} from '../action/PositionActions';
import DisruptionBanner from './DisruptionBanner';
import StopsNearYouSearch from './StopsNearYouSearch';
import {
  getSavedGeolocationPermission,
  setSavedGeolocationPermission,
} from '../store/localStorage';
import withSearchContext from './WithSearchContext';
import { PREFIX_NEARYOU } from '../util/path';
import StopsNearYouContainer from './StopsNearYouContainer';
import StopsNearYouMap from './map/StopsNearYouMap';

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);

class StopsNearYouPage extends React.Component { // eslint-disable-line
  static contextTypes = {
    config: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    breakpoint: PropTypes.string.isRequired,
    loadingPosition: PropTypes.bool,
    relayEnvironment: PropTypes.object,
    params: PropTypes.shape({
      place: PropTypes.string,
      origin: PropTypes.string,
    }),
    hasLocation: PropTypes.bool,
    position: PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number,
      status: PropTypes.string,
      hasLocation: PropTypes.bool,
      address: PropTypes.string,
    }),
    lang: PropTypes.string.isRequired,
    isModalNeeded: PropTypes.bool,
    queryString: PropTypes.string,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
  };

  static defaultProps = {
    isModalNeeded: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      startPosition: null,
      updatedLocation: null,
      loadingGeolocationState: true,
      modalClosed: false,
    };
  }

  componentDidUpdate() {
    const savedPermission = getSavedGeolocationPermission();
    if (
      !this.props.position &&
      savedPermission.state === 'denied' &&
      this.state.modalClosed
    ) {
      this.context.executeAction(showGeolocationDeniedMessage);
    }
    // if there is no location access but origin is set, append it to url
    if (
      this.props.match.params &&
      this.props.match.params.origin &&
      savedPermission.state !== 'granted' &&
      !this.props.hasLocation
    ) {
      const queryString = this.props.queryString || '';
      this.props.router.replace(
        `/${PREFIX_NEARYOU}/${this.props.match.params.mode}/${this.props.match.params.origin}${queryString}`,
      );
    }
    // if we have location access, clear origin from url
    if (
      this.props.match.params &&
      this.props.match.params.origin &&
      savedPermission.state === 'granted' &&
      !this.state.loadingGeolocationState
    ) {
      const queryString = this.props.queryString || '';
      this.props.router.replace(
        `/${PREFIX_NEARYOU}/${this.props.match.params.mode}/POS${queryString}`,
      );
    }
  }

  componentDidMount() {
    checkPositioningPermission().then(permission => {
      setSavedGeolocationPermission('state', permission.state);
      if (permission.state === 'granted') {
        this.context.executeAction(startLocationWatch);
      }
      this.setState({ loadingGeolocationState: false });
    });
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    if (
      !prevState.startPosition &&
      nextProps.position &&
      nextProps.position.lat &&
      nextProps.position.lon
    ) {
      return {
        startPosition: nextProps.position,
        updatedLocation: nextProps.position,
      };
    }
    if (
      !prevState.startPosition ||
      (!prevState.startPosition.address &&
        nextProps.position &&
        nextProps.position.address)
    ) {
      return {
        startPosition: nextProps.position,
        updatedLocation: nextProps.position,
      };
    }
    // ensure that position is updated when browsing with a direct link to a location
    if (
      nextProps.params &&
      !nextProps.params.origin &&
      nextProps.params.place !== 'POS' &&
      nextProps.position &&
      nextProps.position.address
    ) {
      return {
        startPosition: nextProps.position,
        updatedLocation: nextProps.position,
      };
    }
    return null;
  };

  getQueryVariables = () => {
    const { startPosition } = this.state;
    const { mode } = this.props.match.params;
    let placeTypes = 'STOP';
    let modes = [mode];
    if (mode === 'CITYBIKE') {
      placeTypes = 'BICYCLE_RENT';
      modes = ['BICYCLE'];
    }
    const lat =
      startPosition && startPosition.lat
        ? startPosition.lat
        : this.context.config.defaultEndpoint.lat;
    const lon =
      startPosition && startPosition.lon
        ? startPosition.lon
        : this.context.config.defaultEndpoint.lon;
    return {
      lat,
      lon,
      maxResults: 2000,
      first: this.context.config.maxNearbyStopAmount,
      maxDistance: this.context.config.maxNearbyStopDistance,
      filterByModes: modes,
      filterByPlaceTypes: placeTypes,
      omitNonPickups: this.context.config.omitNonPickups,
    };
  };

  positionChanged = () => {
    const { updatedLocation } = this.state;
    if (
      updatedLocation &&
      updatedLocation.lat &&
      this.props.position &&
      this.props.position.lat
    ) {
      if (distance(updatedLocation, this.props.position) > 100) {
        return true;
      }
    }
    return false;
  };

  updateLocation = () => {
    this.setState({
      updatedLocation: this.props.position,
    });
  };

  renderContent = () => {
    const { mode } = this.props.match.params;
    const renderDisruptionBanner = mode !== 'CITYBIKE';
    const renderSearch = mode !== 'FERRY';
    const renderRefetchButton = this.positionChanged();
    return (
      <QueryRenderer
        query={graphql`
          query StopsNearYouPageContentQuery(
            $lat: Float!
            $lon: Float!
            $filterByPlaceTypes: [FilterPlaceType]
            $filterByModes: [Mode]
            $first: Int!
            $maxResults: Int!
            $maxDistance: Int!
            $omitNonPickups: Boolean
          ) {
            stopPatterns: viewer {
              ...StopsNearYouContainer_stopPatterns
              @arguments(
                lat: $lat
                lon: $lon
                filterByPlaceTypes: $filterByPlaceTypes
                filterByModes: $filterByModes
                first: $first
                maxResults: $maxResults
                maxDistance: $maxDistance
                omitNonPickups: $omitNonPickups
              )
            }
            alerts: alerts(severityLevel: [SEVERE]) {
              ...DisruptionBanner_alerts
            }
          }
        `}
        variables={this.getQueryVariables()}
        environment={this.props.relayEnvironment}
        render={({ props }) => {
          if (props) {
            return (
              <div className="stops-near-you-page">
                {renderDisruptionBanner && (
                  <DisruptionBanner
                    alerts={props.alerts || []}
                    mode={mode}
                    trafficNowLink={this.context.config.trafficNowLink}
                  />
                )}
                {renderSearch && (
                  <StopsNearYouSearch
                    mode={mode}
                    breakpoint={this.props.breakpoint}
                  />
                )}
                {renderRefetchButton && (
                  <div className="nearest-stops-update-container">
                    <FormattedMessage id="nearest-stops-updated-location" />
                    <button
                      aria-label={this.context.intl.formatMessage({
                        id: 'show-more-stops-near-you',
                        defaultMessage: 'Load more nearby stops',
                      })}
                      className="update-stops-button"
                      onClick={this.updateLocation}
                    >
                      <Icon img="icon-icon_update" />
                      <FormattedMessage
                        id="nearest-stops-update-location"
                        defaultMessage="Update stops"
                        values={{
                          mode: (
                            <FormattedMessage
                              id={`nearest-stops-${mode.toLowerCase()}`}
                            />
                          ),
                        }}
                      />
                    </button>
                  </div>
                )}
                <StopsNearYouContainer
                  match={this.props.match}
                  stopPatterns={props.stopPatterns}
                  position={
                    this.state.updatedLocation ||
                    this.state.startPosition ||
                    this.context.config.defaultEndpoint
                  }
                />
              </div>
            );
          }
          return undefined;
        }}
      />
    );
  };

  renderMap = () => {
    return (
      <QueryRenderer
        query={graphql`
          query StopsNearYouPageStopsQuery(
            $lat: Float!
            $lon: Float!
            $filterByPlaceTypes: [FilterPlaceType]
            $filterByModes: [Mode]
            $first: Int!
            $maxResults: Int!
            $maxDistance: Int!
            $omitNonPickups: Boolean
          ) {
            stops: viewer {
              ...StopsNearYouMap_stops
              @arguments(
                lat: $lat
                lon: $lon
                filterByPlaceTypes: $filterByPlaceTypes
                filterByModes: $filterByModes
                first: $first
                maxResults: $maxResults
                maxDistance: $maxDistance
                omitNonPickups: $omitNonPickups
              )
            }
          }
        `}
        variables={this.getQueryVariables()}
        environment={this.props.relayEnvironment}
        render={({ props }) => {
          if (props) {
            return (
              <StopsNearYouMap
                position={
                  this.state.updatedLocation ||
                  this.state.startPosition ||
                  this.context.config.defaultEndpoint
                }
                stops={props.stops}
                match={this.props.match}
              />
            );
          }
          return undefined;
        }}
      />
    );
  };

  createBckBtnUrl = () => {
    const { position } = this.props;
    const { place } = this.props.match.params;
    const { search } = this.props.match.location || '';
    if (place === 'POS' && !position) {
      const location = this.context.config.defaultEndpoint;
      return `/${encodeURIComponent(
        `${location.address}::${location.lat},${location.lon}`,
      )}/-${search}`;
    }
    if (place === 'POS' && position && position.hasLocation) {
      return `/${encodeURIComponent(
        `${position.address}::${position.lat},${position.lon}`,
      )}/-${search}`;
    }
    return `/${place}/-${search}`;
  };

  handleClose = () => {
    setSavedGeolocationPermission('state', 'denied');
    this.setState({
      modalClosed: true,
    });
  };

  handleGrantGeolocation = () => {
    setSavedGeolocationPermission('state', 'granted');
    this.context.executeAction(startLocationWatch);
    this.setState({
      modalClosed: true,
    });
  };

  renderAutoSuggestField = () => {
    const isMobile = this.props.breakpoint !== 'large';
    return (
      <DTAutoSuggestWithSearchContext
        appElement="#app"
        icon="search"
        sources={['History', 'Datasource', 'Favourite']}
        targets={['Locations', 'Stops']}
        id="origin-stop-near-you"
        placeholder="origin"
        value=""
        lang={this.props.lang}
        mode={this.props.match.params.mode}
        isMobile={isMobile}
      />
    );
  };

  renderDialogModal = savedChoice => {
    return (
      <Modal
        appElement="#app"
        contentLabel="content label"
        closeButtonLabel={this.context.intl.formatMessage({
          id: 'close',
        })}
        variant="small"
        isOpen
        onCrossClick={this.handleClose}
      >
        <div className="modal-desktop-container">
          <div className="modal-desktop-top">
            <div className="modal-desktop-header">
              <FormattedMessage id="stop-near-you-modal-header" />
            </div>
          </div>
          <div className="modal-desktop-text">
            <FormattedMessage id="stop-near-you-modal-info" />
          </div>
          <div className="modal-desktop-text title">
            <FormattedMessage id="origin" />
          </div>
          <div className="modal-desktop-main">
            <div className="modal-desktop-location-search">
              {this.renderAutoSuggestField()}
            </div>
          </div>
          <div className="modal-desktop-text title2">
            <FormattedMessage id="stop-near-you-modal-grant-permission" />
          </div>
          {savedChoice !== 'denied' && (
            <div className="modal-desktop-buttons">
              <button
                type="submit"
                className="modal-desktop-button save"
                onClick={() => this.handleGrantGeolocation()}
              >
                <DTIcon img="locate" height={1.375} width={1.375} />
                <FormattedMessage id="use-own-position" />
              </button>
            </div>
          )}
          {savedChoice === 'denied' && (
            <div className="modal-desktop-text info">
              <FormattedMessage id="stop-near-you-modal-grant-permission-info" />
            </div>
          )}
        </div>
      </Modal>
    );
  };

  shouldRenderModal() {
    const { origin } = this.props.match.params;
    const { position, isModalNeeded } = this.props;
    const savedChoice = getSavedGeolocationPermission();
    if (savedChoice.state === 'granted' || this.state.modalClosed) {
      return false;
    }
    if (origin && savedChoice.state === 'denied') {
      return false;
    }
    if (position && !isModalNeeded) {
      return false;
    }
    if (savedChoice.state === 'prompt' && origin) {
      return false;
    }
    return true;
  }

  render() {
    const showModal = this.shouldRenderModal();
    const savedChoice = getSavedGeolocationPermission();
    const { loadingPosition } = this.props;
    const { mode } = this.props.match.params;
    if ((!showModal && loadingPosition) || this.state.loadingGeolocationState) {
      return <Loading />;
    }
    if (!showModal) {
      return (
        <DesktopOrMobile
          desktop={() => (
            <DesktopView
              title={
                <FormattedMessage
                  id="nearest"
                  defaultMessage="Stops near you"
                  values={{
                    mode: (
                      <FormattedMessage
                        id={`nearest-stops-${mode.toLowerCase()}`}
                      />
                    ),
                  }}
                />
              }
              scrollable
              content={this.renderContent()}
              map={this.renderMap()}
              bckBtnColor={this.context.config.colors.primary}
              bckBtnUrl={
                this.context.config.URL.ROOTLINK
                  ? undefined
                  : this.createBckBtnUrl()
              }
            />
          )}
          mobile={() => (
            <MobileView
              content={this.renderContent()}
              map={this.renderMap()}
              bckBtnColor={this.context.config.colors.primary}
              bckBtnUrl={
                this.context.config.URL.ROOTLINK
                  ? undefined
                  : this.createBckBtnUrl()
              }
            />
          )}
        />
      );
    }
    return <div>{this.renderDialogModal(savedChoice.state)}</div>;
  }
}

const StopsNearYouPageWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <StopsNearYouPage {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

const PositioningWrapper = connectToStores(
  StopsNearYouPageWithBreakpoint,
  ['PositionStore', 'PreferencesStore', 'FavouriteStore'],
  (context, props) => {
    const lang = context.getStore('PreferencesStore').getLanguage();
    if (
      context.config.allowLogin &&
      context.getStore('UserStore').getUser().sub !== undefined
    ) {
      context.getStore('FavouriteStore').getFavourites();
    }
    const { params, location } = props.match;
    const { place } = params;
    if (place !== 'POS') {
      const position = otpToLocation(place);
      return {
        ...props,
        isModalNeeded: !position,
        position,
        lang,
        params,
        queryString: location.search,
      };
    }
    const locationState = context.getStore('PositionStore').getLocationState();
    if (locationState.hasLocation) {
      return {
        ...props,
        position: locationState,
        hasLocation: true,
        loadingPosition: false,
        lang,
        queryString: location.search,
      };
    }
    if (locationState.locationingFailed) {
      // Use url origin or default endpoint when positioning fails
      if (params.origin) {
        const position = otpToLocation(params.origin);

        return {
          ...props,
          position,
          isModalNeeded: false,
          loadingPosition: false,
          lang,
          params,
          queryString: location.search,
        };
      }
      return {
        ...props,
        position: context.config.defaultEndpoint,
        isModalNeeded: true,
        loadingPosition: false,
        lang,
        params,
        queryString: location.search,
      };
    }

    if (
      !locationState.hasLocation &&
      (locationState.isLocationingInProgress ||
        locationState.isReverseGeocodingInProgress)
    ) {
      return {
        ...props,
        loadingPosition: true,
        lang,
        params,
        queryString: location.search,
      };
    }
    return {
      ...props,
      position: undefined,
      isModalNeeded: false,
      loadingPosition: false,
      lang,
      params,
      queryString: location.search,
    };
  },
);

PositioningWrapper.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export {
  PositioningWrapper as default,
  StopsNearYouPageWithBreakpoint as Component,
};
