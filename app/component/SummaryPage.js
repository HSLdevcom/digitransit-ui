import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import polyline from 'polyline-encoded';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import isEqual from 'lodash/isEqual';
import storeOrigin from '../action/originActions';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import MapContainer from './map/MapContainer';
import SummaryPlanContainer from './SummaryPlanContainer';
import SummaryNavigation from './SummaryNavigation';
import ItineraryLine from './map/ItineraryLine';
import LocationMarker from './map/LocationMarker';
import MobileItineraryWrapper from './MobileItineraryWrapper';
import Loading from './Loading';
import { getHomeUrl } from '../util/path';
import { getIntermediatePlaces } from '../util/queryUtils';
import { validateServiceTimeRange } from '../util/timeUtils';
import withBreakpoint from '../util/withBreakpoint';
import ComponentUsageExample from './ComponentUsageExample';
import exampleData from './data/SummaryPage.ExampleData';
import { isBrowser } from '../util/browser';
import { itineraryHasCancelation } from '../util/alertUtils';
import triggerMessage from '../util/messageUtils';
import MessageStore from '../store/MessageStore';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { otpToLocation } from '../util/otpStrings';

export const ITINERARYFILTERING_DEFAULT = 1.5;

/**
 * Returns the actively selected itinerary's index. Attempts to look for
 * the information in the location's state and pathname, respectively.
 * Otherwise, pre-selects the first non-cancelled itinerary or, failing that,
 * defaults to the index 0.
 *
 * @param {{ pathname: string, state: * }} location the current location object.
 * @param {*} itineraries the itineraries retrieved from OTP.
 * @param {number} defaultValue the default value, defaults to 0.
 */
export const getActiveIndex = (
  { pathname, state } = {},
  itineraries = [],
  defaultValue = 0,
) => {
  if (state) {
    return state.summaryPageSelected || defaultValue;
  }

  /*
   * If state does not exist, for example when accessing the summary
   * page by an external link, we check if an itinerary selection is
   * supplied in URL and make that the active selection.
   */
  const lastURLSegment = pathname && pathname.split('/').pop();
  if (!Number.isNaN(Number(lastURLSegment))) {
    return Number(lastURLSegment);
  }

  /**
   * Pre-select the first not-cancelled itinerary, if available.
   */
  const itineraryIndex = findIndex(
    itineraries,
    itinerary => !itineraryHasCancelation(itinerary),
  );
  return itineraryIndex > 0 ? itineraryIndex : defaultValue;
};

/**
 * Report any errors that happen when showing summary
 *
 * @param {Error|string|any} error
 */
export function reportError(error) {
  if (!error) {
    return;
  }
  addAnalyticsEvent({
    category: 'Itinerary',
    action: 'ErrorLoading',
    name: 'SummaryPage',
    message: error.message || error,
    stack: error.stack || null,
  });
}

class SummaryPage extends React.Component {
  static contextTypes = {
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
    config: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
  };

  static propTypes = {
    match: matchShape.isRequired,
    plan: PropTypes.shape({
      itineraries: PropTypes.array,
    }).isRequired,
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    content: PropTypes.node,
    map: PropTypes.shape({
      type: PropTypes.func.isRequired,
    }),
    breakpoint: PropTypes.string.isRequired,
  };

  static defaultProps = {
    map: undefined,
  };

  constructor(props, context) {
    super(props, context);
    context.executeAction(storeOrigin, props.match.params.from);
    // const error = get(context, 'queryAggregator.readyState.error', null);
    // if (error) {
    //   reportError(error);
    // }
  }

  state = { center: null, loading: false };

  componentDidMount() {
    const host =
      this.context.headers &&
      (this.context.headers['x-forwarded-host'] || this.context.headers.host);

    if (
      get(this.context, 'config.showHSLTracking', false) &&
      host &&
      host.indexOf('127.0.0.1') === -1 &&
      host.indexOf('localhost') === -1
    ) {
      import('../util/feedbackly');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.match.params.from, this.props.match.params.from)) {
      this.context.executeAction(storeOrigin, nextProps.match.params.from);
    }

    if (nextProps.breakpoint === 'large' && this.state.center) {
      this.setState({ center: null });
    }
  }

  componentDidUpdate() {
    // const error = get(this.context, 'queryAggregator.readyState.error', null);
    // if (error) {
    //   reportError(error);
    // }
  }

  setLoading = loading => {
    this.setState({ loading });
  };

  setError = error => {
    reportError(error);
    this.context.queryAggregator.readyState.error = error;
  };

  updateCenter = (lat, lon) => {
    this.setState({ center: { lat, lon } });
  };

  renderMap() {
    const { plan, match } = this.props;
    const {
      config: { defaultEndpoint },
    } = this.context;
    const itineraries = (plan && plan.itineraries) || [];
    const activeIndex = getActiveIndex(match.location, itineraries);
    const from = otpToLocation(match.params.from);
    const to = otpToLocation(match.params.to);

    triggerMessage(
      from.lat,
      from.lon,
      this.context,
      this.context.getStore(MessageStore).getMessages(),
    );

    triggerMessage(
      to.lat,
      to.lon,
      this.context,
      this.context.getStore(MessageStore).getMessages(),
    );

    const leafletObjs = sortBy(
      itineraries.map((itinerary, i) => (
        <ItineraryLine
          key={i}
          hash={i}
          legs={itinerary.legs}
          passive={i !== activeIndex}
          showIntermediateStops={i === activeIndex}
        />
      )),
      // Make sure active line isn't rendered over
      i => i.props.passive === false,
    );

    if (from.lat && from.lon) {
      leafletObjs.push(
        <LocationMarker key="fromMarker" position={from} type="from" />,
      );
    }

    if (to.lat && to.lon) {
      leafletObjs.push(
        <LocationMarker isLarge key="toMarker" position={to} type="to" />,
      );
    }

    getIntermediatePlaces(match.location.query).forEach(
      (intermediatePlace, i) => {
        leafletObjs.push(
          <LocationMarker key={`via_${i}`} position={intermediatePlace} />,
        );
      },
    );

    // Decode all legs of all itineraries into latlong arrays,
    // and concatenate into one big latlong array
    const bounds = []
      .concat(
        [[from.lat, from.lon], [to.lat, to.lon]],
        ...itineraries.map(itinerary =>
          [].concat(
            ...itinerary.legs.map(leg =>
              polyline.decode(leg.legGeometry.points),
            ),
          ),
        ),
      )
      .filter(a => a[0] && a[1]);

    const centerPoint = {
      lat: from.lat || to.lat || defaultEndpoint.lat,
      lon: from.lon || to.lon || defaultEndpoint.lon,
    };
    const delta = 0.0269; // this is roughly equal to 3 km
    const defaultBounds = [
      [centerPoint.lat - delta, centerPoint.lon - delta],
      [centerPoint.lat + delta, centerPoint.lon + delta],
    ];
    return (
      <MapContainer
        className="summary-map"
        leafletObjs={leafletObjs}
        fitBounds
        bounds={bounds.length > 1 ? bounds : defaultBounds}
        showScaleBar
      />
    );
  }

  render() {
    const { location } = this.context;

    const hasItineraries =
      this.props.plan && Array.isArray(this.props.plan.itineraries);
    let itineraries = hasItineraries ? this.props.plan.itineraries : [];

    // Remove old itineraries if new query cannot find a route
    if (hasItineraries) {
      itineraries = [];
    }

    if (
      // this.props.routes[this.props.routes.length - 1].printPage &&
      hasItineraries
    ) {
      return React.cloneElement(this.props.content, {
        itinerary: itineraries[this.props.match.params.hash],
        focus: this.updateCenter,
        from: otpToLocation(this.props.match.params.from),
        to: otpToLocation(this.props.match.params.to),
      });
    }

    // Call props.map directly in order to render to same map instance
    const map = this.props.map
      ? this.props.map.type(
          {
            itinerary: itineraries && itineraries[this.props.match.params.hash],
            center: this.state.center,
            ...this.props,
          },
          this.context,
        )
      : this.renderMap();

    let earliestStartTime;
    let latestArrivalTime;

    if (hasItineraries) {
      earliestStartTime = Math.min(...itineraries.map(i => i.startTime));
      latestArrivalTime = Math.max(...itineraries.map(i => i.endTime));
    }

    let intermediatePlaces = [];
    const { query } = this.props.match.location;

    if (query && query.intermediatePlaces) {
      if (Array.isArray(query.intermediatePlaces)) {
        intermediatePlaces = query.intermediatePlaces.map(otpToLocation);
      } else {
        intermediatePlaces = [otpToLocation(query.intermediatePlaces)];
      }
    }

    // added config.itinerary.serviceTimeRange parameter (DT-3175)
    const serviceTimeRange = validateServiceTimeRange(
      this.context.config.itinerary.serviceTimeRange,
      this.props.serviceTimeRange,
    );
    if (this.props.breakpoint === 'large') {
      let content;
      if (this.state.loading === false && this.props.plan) {
        content = (
          <SummaryPlanContainer
            activeIndex={getActiveIndex(location, itineraries)}
            plan={this.props.plan}
            serviceTimeRange={serviceTimeRange}
            itineraries={itineraries}
            params={this.props.match.params}
            // error={error}
            setLoading={this.setLoading}
            // setError={this.setError}
          >
            {this.props.content &&
              React.cloneElement(this.props.content, {
                itinerary:
                  hasItineraries && itineraries[this.props.match.params.hash],
                focus: this.updateCenter,
                plan: this.props.plan,
              })}
          </SummaryPlanContainer>
        );
      } else {
        content = (
          <div style={{ position: 'relative', height: 200 }}>
            <Loading />
          </div>
        );
      }

      return (
        <DesktopView
          title={
            <FormattedMessage
              id="summary-page.title"
              defaultMessage="Itinerary suggestions"
            />
          }
          homeUrl={getHomeUrl(
            this.props.match.params.from,
            this.props.match.params.to,
          )}
          header={
            <SummaryNavigation
              params={this.props.match.params}
              serviceTimeRange={serviceTimeRange}
              startTime={earliestStartTime}
              endTime={latestArrivalTime}
            />
          }
          content={content}
          map={map}
          scrollable
        />
      );
    }

    let content;

    if (!this.props.plan || this.state.loading !== false) {
      content = (
        <div style={{ position: 'relative', height: 200 }}>
          <Loading />
        </div>
      );
    } else if (this.props.match.params.hash) {
      content = (
        <MobileItineraryWrapper
          itineraries={itineraries}
          params={this.props.match.params}
          focus={this.updateCenter}
        >
          {this.props.content &&
            itineraries.map((itinerary, i) =>
              React.cloneElement(this.props.content, {
                key: i,
                itinerary,
                plan: this.props.plan,
              }),
            )}
        </MobileItineraryWrapper>
      );
    } else {
      content = (
        <SummaryPlanContainer
          activeIndex={getActiveIndex(location, itineraries)}
          plan={this.props.plan}
          serviceTimeRange={serviceTimeRange}
          itineraries={itineraries}
          params={this.props.match.params}
          // error={error}
          setLoading={this.setLoading}
          // setError={this.setError}
          from={this.props.match.params.from}
          to={this.props.match.params.to}
          intermediatePlaces={intermediatePlaces}
        />
      );
    }

    return (
      <MobileView
        header={
          !this.props.match.params.hash ? (
            <SummaryNavigation
              params={this.props.match.params}
              serviceTimeRange={serviceTimeRange}
              startTime={earliestStartTime}
              endTime={latestArrivalTime}
            />
          ) : (
            false
          )
        }
        homeUrl={getHomeUrl(
          this.props.match.params.from,
          this.props.match.params.to,
        )}
        content={content}
        map={map}
      />
    );
  }
}

const SummaryPageWithBreakpoint = withBreakpoint(SummaryPage);

SummaryPageWithBreakpoint.description = (
  <ComponentUsageExample isFullscreen>
    {isBrowser && <SummaryPageWithBreakpoint {...exampleData} />}
  </ComponentUsageExample>
);

const containerComponent = createFragmentContainer(SummaryPageWithBreakpoint, {
  plan: graphql`
    fragment SummaryPage_plan on Plan {
      ...SummaryPlanContainer_plan
      ...ItineraryTab_plan
      itineraries {
        startTime
        endTime
        ...ItineraryTab_itinerary
        ...PrintableItinerary_itinerary
        ...SummaryPlanContainer_itineraries
        legs {
          ...ItineraryLine_legs
          transitLeg
          legGeometry {
            points
          }
        }
      }
    }
  `,
  serviceTimeRange: graphql`
    fragment SummaryPage_serviceTimeRange on serviceTimeRange {
      start
      end
    }
  `,
});

export {
  containerComponent as default,
  SummaryPageWithBreakpoint as Component,
};
