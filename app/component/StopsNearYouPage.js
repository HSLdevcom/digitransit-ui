import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { matchShape, routerShape } from 'found';
import withBreakpoint from '../util/withBreakpoint';
import StopsNearYouContainer from './StopsNearYouContainer';
import Loading from './Loading';
import BackButton from './BackButton';
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
    stopPatterns: PropTypes.any.isRequired,
    alerts: PropTypes.any.isRequired,
    breakpoint: PropTypes.string.isRequired,
    loadingPosition: PropTypes.bool,
  };

  render() {
    let content;
    const { mode } = this.context.match.params;
    const renderDisruptionBanner = mode !== 'CITYBIKE';
    const renderSearch = mode !== 'FERRY';
    if (this.props.loadingPosition) {
      content = <Loading />;
    } else {
      content = (
        <div className="stops-near-you-page">
          {renderDisruptionBanner && (
            <DisruptionBanner
              trafficNowLink={this.context.config.trafficNowLink}
              alerts={this.props.alerts}
              mode={mode}
            />
          )}
          {renderSearch && (
            <StopsNearYouSearch
              mode={mode}
              breakpoint={this.props.breakpoint}
            />
          )}
          <StopsNearYouContainer
            stopPatterns={this.props.stopPatterns}
            match={this.context.match}
            router={this.context.router}
          />
        </div>
      );
    }
    if (this.props.breakpoint === 'large') {
      return (
        <>
          <BackButton
            icon="icon-icon_arrow-collapse--left"
            iconClassName="arrow-icon"
            className="back-button near-you-back-button"
            title={
              <FormattedMessage
                id="nearest-stops"
                defaultMessage="Stops near you"
              />
            }
            color={this.context.config.colors.primary}
          />
          {content}
        </>
      );
    }
    return content;
  }
}

const StopsNearYouPageWithBreakpoint = withBreakpoint(StopsNearYouPage);

const containerComponent = createFragmentContainer(
  StopsNearYouPageWithBreakpoint,
  {
    stopPatterns: graphql`
      fragment StopsNearYouPage_stopPatterns on QueryType
        @argumentDefinitions(
          startTime: { type: "Long!", defaultValue: 0 }
          omitNonPickups: { type: "Boolean!", defaultValue: false }
          lat: { type: "Float!", defaultValue: 0 }
          lon: { type: "Float!", defaultValue: 0 }
          filterByPlaceTypes: { type: "[FilterPlaceType]", defaultValue: null }
          filterByModes: { type: "[Mode]", defaultValue: null }
          first: { type: "Int!", defaultValue: 5 }
          maxResults: { type: "Int" }
          maxDistance: { type: "Int" }
        ) {
        ...StopsNearYouContainer_stopPatterns
          @arguments(omitNonPickups: $omitNonPickups
                      startTime: $startTime
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
    `,
    alerts: graphql`
      fragment StopsNearYouPage_alerts on placeAtDistanceConnection
        @argumentDefinitions(
          omitNonPickups: { type: "Boolean!", defaultValue: false }
        ) {
        ...DisruptionBanner_alerts @arguments(omitNonPickups: $omitNonPickups)
      }
    `,
  },
);

export {
  containerComponent as default,
  StopsNearYouPageWithBreakpoint as Component,
};
