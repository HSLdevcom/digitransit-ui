import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, ReactRelayContext, QueryRenderer } from 'react-relay';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import withBreakpoint, { DesktopOrMobile } from '../util/withBreakpoint';
import { otpToLocation } from '../util/otpStrings';
import Loading from './Loading';
import { startLocationWatch } from '../action/PositionActions';
import DisruptionBanner from './DisruptionBanner';
import StopsNearYouSearch from './StopsNearYouSearch';

class StopsNearYouPage extends React.Component { // eslint-disable-line
  static contextTypes = {
    config: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
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
    }),
  };

  state = {
    startPosition: null,
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
            $maxResults: Int!
            $maxDistance: Int!
            $omitNonPickups: Boolean
          ) {
            stopPatterns: viewer {
              ...StopsNearYouContainer_stopPatterns
                @arguments(
                  omitNonPickups: $omitNonPickups
                  lat: $lat
                  lon: $lon
                  filterByPlaceTypes: $filterByPlaceTypes
                  filterByModes: $filterByModes
                  first: $first
                  maxResults: $maxResults
                  maxDistance: $maxDistance
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

  render() {
    if (this.props.loadingPosition) {
      return <Loading />;
    }
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
            content={this.renderContent()}
            map={this.renderMap()}
            bckBtnColor={this.context.config.colors.primary}
          />
        )}
        mobile={() => (
          <MobileView
            content={this.renderContent()}
            map={this.renderMap()}
            bckBtnColor={this.context.config.colors.primary}
          />
        )}
      />
    );
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
  ['PositionStore'],
  (context, props) => {
    const { place } = props.match.params;
    if (place !== 'POS') {
      const position = otpToLocation(place);
      return { ...props, position };
    }
    const locationState = context.getStore('PositionStore').getLocationState();
    if (locationState.locationingFailed) {
      // Use default endpoint when positioning fails
      return {
        ...props,
        position: context.config.defaultEndpoint,
        loadingPosition: false,
      };
    }

    if (
      !locationState.hasLocation &&
      (locationState.isLocationingInProgress ||
        locationState.isReverseGeocodingInProgress)
    ) {
      return { ...props, loadingPosition: true };
    }

    if (locationState.hasLocation) {
      return { ...props, position: locationState, loadingPosition: false };
    }
    context.executeAction(startLocationWatch);
    return { ...props, loadingPosition: true };
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
