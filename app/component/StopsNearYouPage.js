import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { graphql, ReactRelayContext, QueryRenderer } from 'react-relay';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Modal from '@hsl-fi/modal';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import Icon from '@digitransit-component/digitransit-component-icon';
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

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);

class StopsNearYouPage extends React.Component { // eslint-disable-line
  static contextTypes = {
    config: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    breakpoint: PropTypes.string.isRequired,
    loadingPosition: PropTypes.bool,
    content: PropTypes.node,
    map: PropTypes.node,
    relayEnvironment: PropTypes.object,
    position: PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number,
      status: PropTypes.string,
    }),
    lang: PropTypes.string.isRequired,
    isModalNeeded: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      startPosition: null,
      geolocationPermission: {
        loading: true,
        state: undefined,
        closingModal: false,
      },
    };

    this.checkGeolocation();
  }

  checkGeolocation = async () => {
    try {
      this.setState({
        geolocationPermission: {
          loading: true,
          state: 'unknown',
        },
      });
      const result = await checkPositioningPermission();
      setSavedGeolocationPermission('state', result.state);
      this.setState({
        geolocationPermission: {
          loading: false,
          state: result.state,
        },
      });
    } catch (e) {
      this.setState({
        geolocationPermission: {
          loading: false,
          state: 'error',
        },
      });
    }
  };

  static getDerivedStateFromProps = (nextProps, prevState) => {
    if (
      !prevState.startPosition &&
      nextProps.position &&
      nextProps.position.lat &&
      nextProps.position.lon
    ) {
      return {
        startPosition: nextProps.position,
      };
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
      maxResults: this.context.config.maxNearbyStopAmount,
      first: this.context.config.maxNearbyStopAmount,
      maxDistance: this.context.config.maxNearbyStopDistance,
      filterByModes: modes,
      filterByPlaceTypes: placeTypes,
      omitNonPickups: this.context.config.omitNonPickups,
    };
  };

  renderContent = () => {
    const { mode } = this.context.match.params;
    const renderDisruptionBanner = mode !== 'CITYBIKE';
    const renderSearch = mode !== 'FERRY';
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
            alerts: nearest(
              lat: $lat
              lon: $lon
              filterByPlaceTypes: $filterByPlaceTypes
              filterByModes: $filterByModes
              maxResults: $maxResults
            ) {
              ...DisruptionBanner_alerts
              @arguments(omitNonPickups: $omitNonPickups)
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
                  <DisruptionBanner alerts={props.alerts || []} mode={mode} />
                )}
                {renderSearch && (
                  <StopsNearYouSearch
                    mode={mode}
                    breakpoint={this.props.breakpoint}
                  />
                )}
                {this.props.content &&
                  React.cloneElement(this.props.content, {
                    stopPatterns: props.stopPatterns,
                    match: this.context.match,
                    router: this.context.router,
                  })}
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
            $maxResults: Int!
            $maxDistance: Int!
            $omitNonPickups: Boolean
          ) {
            stops: nearest(
              lat: $lat
              lon: $lon
              filterByPlaceTypes: $filterByPlaceTypes
              filterByModes: $filterByModes
              maxResults: $maxResults
              maxDistance: $maxDistance
            ) {
              ...StopsNearYouMap_stops
              @arguments(omitNonPickups: $omitNonPickups)
            }
          }
        `}
        variables={this.getQueryVariables()}
        environment={this.props.relayEnvironment}
        render={({ props }) => {
          if (props) {
            return (
              this.props.map &&
              React.cloneElement(this.props.map, {
                position: this.state.startPosition,
                stops: props.stops,
                match: this.context.match,
                router: this.context.router,
              })
            );
          }
          return undefined;
        }}
      />
    );
  };

  createBckBtnUrl = () => {
    const { location } = this.context.match ? this.context.match : undefined;
    if (location && location.pathname) {
      const origin = location.pathname.substring(1).split('/').pop();
      const search = location.search ? location.search : '';
      return `/${origin}/-${search}`;
    }
    return undefined;
  };

  handleClose = () => {
    setSavedGeolocationPermission('choice', 'rejected');
    const { geolocationPermission } = this.state;
    this.setState({
      geolocationPermission: {
        ...geolocationPermission,
        loading: false,
        closingModal: true,
      },
    });
  };

  handleGrantGeolocation = () => {
    setSavedGeolocationPermission('choice', 'granted');
    this.context.executeAction(startLocationWatch);
    const { geolocationPermission } = this.state;
    this.setState({
      geolocationPermission: {
        ...geolocationPermission,
        loading: false,
        closingModal: true,
      },
    });
  };

  renderAutoSuggestField = () => {
    return (
      <DTAutoSuggestWithSearchContext
        appElement="#app"
        icon="search"
        sources={['History', 'Datasource']}
        targets={['Locations', 'Stops']}
        id="origin-stop-near-you"
        placeholder="origin"
        value=""
        lang={this.props.lang}
        mode={this.context.match.params.mode}
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
                <Icon img="locate" height={1.375} width={1.375} />
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

  render() {
    let showModal = true;
    let proceed = false;
    let savedChoice;
    const { loadingPosition, position, isModalNeeded } = this.props;
    const { params } = this.context.match;

    if (isModalNeeded !== undefined && !isModalNeeded && position) {
      showModal = false;
      proceed = true;
    } else {
      const { geolocationPermission } = this.state;
      if (!geolocationPermission.loading) {
        if (!geolocationPermission.state) {
          setSavedGeolocationPermission('state', geolocationPermission.state);
        }
        if (geolocationPermission.state === 'granted') {
          this.context.executeAction(startLocationWatch);
          showModal = false;
          proceed = true;
        } else if (params.origin) {
          this.context.router.replace(
            `/${PREFIX_NEARYOU}/${params.mode}/${params.origin}`,
          );
        }

        if (!proceed) {
          if (position) {
            if (position.status) {
              setSavedGeolocationPermission('choice', 'granted');
            } else if (
              getSavedGeolocationPermission().choice !== '' &&
              getSavedGeolocationPermission().choice !== 'rejected'
            ) {
              setSavedGeolocationPermission('choice', 'rejected');
              proceed = true;
              showModal = false;
            }
          }
        }
        if (!proceed) {
          if (geolocationPermission.state !== 'granted') {
            const savedPermission = getSavedGeolocationPermission();
            savedChoice =
              geolocationPermission.state === 'denied'
                ? geolocationPermission.state
                : savedPermission.choice || undefined;
            if (savedPermission.choice === 'granted') {
              this.context.executeAction(startLocationWatch);
              showModal = false;
            } else if (
              !position &&
              savedPermission.choice === 'rejected' &&
              geolocationPermission.closingModal
            ) {
              this.context.executeAction(showGeolocationDeniedMessage);
              showModal = false;
            }
          }
          showModal =
            showModal && geolocationPermission.closingModal ? false : showModal;
          proceed = true;
        }
      }
    }

    if (!proceed && loadingPosition) {
      return <Loading />;
    }
    if (!showModal) {
      return (
        <DesktopOrMobile
          desktop={() => (
            <DesktopView
              title={
                <FormattedMessage
                  id="nearest-stops"
                  defaultMessage="Stops near you"
                />
              }
              scrollable
              content={this.renderContent()}
              map={this.renderMap()}
              bckBtnColor={this.context.config.colors.primary}
              bckBtnUrl={this.createBckBtnUrl()}
            />
          )}
          mobile={() => (
            <MobileView
              content={this.renderContent()}
              map={this.renderMap()}
              bckBtnColor={this.context.config.colors.primary}
              bckBtnUrl={this.createBckBtnUrl()}
            />
          )}
        />
      );
    } else {
      return <div>{this.renderDialogModal(savedChoice)}</div>;
    }
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
  ['PositionStore', 'PreferencesStore'],
  (context, props) => {
    const lang = context.getStore('PreferencesStore').getLanguage();
    const { params } = props.match;
    const { place } = params;
    if (place !== 'POS') {
      const position = otpToLocation(place);
      return { ...props, position, isModalNeeded: false, lang, params };
    }
    const locationState = context.getStore('PositionStore').getLocationState();
    if (locationState.locationingFailed) {
      // Use default endpoint when positioning fails
      return {
        ...props,
        position: context.config.defaultEndpoint,
        loadingPosition: false,
        lang,
        params,
      };
    }

    if (
      !locationState.hasLocation &&
      (locationState.isLocationingInProgress ||
        locationState.isReverseGeocodingInProgress)
    ) {
      return { ...props, loadingPosition: true, lang, params };
    }

    if (locationState.hasLocation) {
      return {
        ...props,
        position: locationState,
        loadingPosition: false,
        lang,
      };
    }
    return {
      ...props,
      position: undefined,
      loadingPosition: true,
      lang,
      params,
    };
  },
);

PositioningWrapper.contextTypes = {
  ...PositioningWrapper.contextTypes,
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export {
  PositioningWrapper as default,
  StopsNearYouPageWithBreakpoint as Component,
};
