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
import { dtLocationShape } from '../util/shapes';
import Icon from './Icon';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import withBreakpoint, { DesktopOrMobile } from '../util/withBreakpoint';
import { otpToLocation, addressToItinerarySearch } from '../util/otpStrings';
import Loading from './Loading';
import {
  checkPositioningPermission,
  startLocationWatch,
  showGeolocationDeniedMessage,
} from '../action/PositionActions';
import DisruptionBanner from './DisruptionBanner';
import StopsNearYouSearch from './StopsNearYouSearch';
import { getGeolocationState } from '../store/localStorage';
import withSearchContext from './WithSearchContext';
import { PREFIX_NEARYOU } from '../util/path';
import StopsNearYouContainer from './StopsNearYouContainer';
import StopsNearYouMap from './map/StopsNearYouMap';

// component initialization phases
const PH_START = 'start';
const PH_SEARCH = 'search';
const PH_SEARCH_GEOLOCATION = 'search+geolocation';
const PH_GEOLOCATIONING = 'geolocationing';
const PH_USEORIGIN = 'useOrigin';
const PH_USEGEOLOCATION = 'useGeolocation';

const PH_SHOWSEARCH = [PH_SEARCH, PH_SEARCH_GEOLOCATION]; // show modal
const PH_READY = [PH_USEORIGIN, PH_USEGEOLOCATION]; // render the actual page

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);

class StopsNearYouPage extends React.Component { // eslint-disable-line
  static contextTypes = {
    config: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    intl: intlShape.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
  };

  static propTypes = {
    breakpoint: PropTypes.string.isRequired,
    relayEnvironment: PropTypes.object.isRequired,
    position: dtLocationShape.isrequired,
    defaultPosition: dtLocationShape,
    lang: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { phase: PH_START };
  }

  componentDidMount() {
    checkPositioningPermission().then(permission => {
      const { origin } = this.context.match.params;
      const savedState = getGeolocationState();
      const { state } = permission;
      let newState;

      if (savedState === 'unknown') {
        if (!origin) {
          // state = 'error' means no permission api, so we assume geolocation will work
          if (state === 'prompt' || state === 'granted' || state === 'error') {
            newState = { phase: PH_SEARCH_GEOLOCATION };
          } else {
            newState = { phase: PH_SEARCH };
          }
        } else {
          newState = {
            phase: PH_USEORIGIN,
            startPosition: this.props.defaultPosition,
            updatedLocation: this.props.defaultPosition,
          };
        }
      } else if (
        state === 'prompt' ||
        state === 'granted' ||
        (state === 'error' && savedState !== 'denied')
      ) {
        // reason to expect that geolocation will work
        newState = { phase: PH_GEOLOCATIONING };
        this.context.executeAction(startLocationWatch);
      } else if (origin) {
        newState = {
          phase: PH_USEORIGIN,
          startPosition: this.props.defaultPosition,
          updatedLocation: this.props.defaultPosition,
        };
      } else {
        newState = { phase: PH_SEARCH };
      }
      this.setState(newState);
    });
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    let newState = {};
    if (prevState.phase === PH_GEOLOCATIONING) {
      if (nextProps.position.locationingFailed) {
        this.context.executeAction(showGeolocationDeniedMessage);
        newState = {
          phase: PH_USEORIGIN,
          startPosition: nextProps.defaultPosition,
          updatedLocation: nextProps.defaultPosition,
        };
      } else if (nextProps.position.hasLocation) {
        newState = {
          phase: PH_USEGEOLOCATION,
          startPosition: nextProps.position,
          updatedLocation: nextProps.position,
        };
      }
      return newState;
    }
    return null;
  };

  getQueryVariables = () => {
    const { startPosition } = this.state;
    const { mode } = this.context.match.params;
    let placeTypes = 'STOP';
    let modes = [mode];
    if (mode === 'CITYBIKE') {
      placeTypes = 'BICYCLE_RENT';
      modes = ['BICYCLE'];
    }
    return {
      lat: startPosition.lat,
      lon: startPosition.lon,
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
    const position = this.getPosition();

    return distance(updatedLocation, position) > 100;
  };

  updateLocation = () => {
    this.setState({ updatedLocation: this.getPosition() });
  };

  getPosition = () => {
    return this.state.phase === PH_USEORIGIN
      ? this.props.defaultPosition
      : this.props.position;
  };

  renderContent = () => {
    const { mode } = this.context.match.params;
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
                    lang={this.props.lang}
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
                  match={this.context.match}
                  stopPatterns={props.stopPatterns}
                  position={this.getPosition()}
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
                position={this.getPosition()}
                stops={props.stops}
                match={this.context.match}
              />
            );
          }
          return undefined;
        }}
      />
    );
  };

  handleClose = () => {
    this.setState({
      phase: PH_USEORIGIN,
      startPosition: this.props.defaultPosition,
      updatedLocation: this.props.defaultPosition,
    });
  };

  handleGrantGeolocation = () => {
    this.context.executeAction(startLocationWatch);
    this.setState({ phase: PH_GEOLOCATIONING });
  };

  selectHandler = item => {
    const { mode } = this.context.match.params;
    let path = `/${PREFIX_NEARYOU}/${mode}/${addressToItinerarySearch(item)}`;
    if (this.context.match.location.search) {
      path += this.context.match.location.search;
    }
    this.context.router.replace(path);
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
        mode={this.context.match.params.mode}
        isMobile={isMobile}
        selectHandler={this.selectHandler} // prop for context handler
      />
    );
  };

  renderDialogModal = () => {
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
          {this.state.phase === PH_SEARCH_GEOLOCATION && (
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
          {this.state.phase === PH_SEARCH && (
            <div className="modal-desktop-text info">
              <FormattedMessage id="stop-near-you-modal-grant-permission-info" />
            </div>
          )}
        </div>
      </Modal>
    );
  };

  render() {
    const { mode } = this.context.match.params;
    const { phase } = this.state;

    if (PH_SHOWSEARCH.includes(phase)) {
      return <div>{this.renderDialogModal()}</div>;
    }
    if (PH_READY.includes(phase)) {
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
            />
          )}
          mobile={() => (
            <MobileView content={this.renderContent()} map={this.renderMap()} />
          )}
        />
      );
    }
    return <Loading />;
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

    // the fav code below looks like a hack - favourite initialization should happen automatically
    if (
      context.config.allowLogin &&
      context.getStore('UserStore').getUser().sub !== undefined
    ) {
      context.getStore('FavouriteStore').getFavourites();
    }
    const { place, origin } = context.match.params;
    let defaultPosition;
    if (origin) {
      defaultPosition = otpToLocation(origin);
    } else {
      defaultPosition = context.config.defaultEndpoint;
    }

    if (place !== 'POS') {
      return {
        ...props,
        position: defaultPosition,
        lang,
      };
    }
    return {
      ...props,
      position: context.getStore('PositionStore').getLocationState(),
      defaultPosition,
      lang,
    };
  },
);

PositioningWrapper.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
};

export {
  PositioningWrapper as default,
  StopsNearYouPageWithBreakpoint as Component,
};
