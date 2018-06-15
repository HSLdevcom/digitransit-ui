import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import Relay from 'react-relay/classic';
import moment from 'moment';
import get from 'lodash/get';
import isMatch from 'lodash/isMatch';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import sortBy from 'lodash/sortBy';
import some from 'lodash/some';
import polyline from 'polyline-encoded';
import { FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';
import isEqual from 'lodash/isEqual';
import { dtLocationShape } from '../util/shapes';
import storeOrigin from '../action/originActions';
import DesktopView from '../component/DesktopView';
import MobileView from '../component/MobileView';
import MapContainer from '../component/map/MapContainer';
import ItineraryTab from './ItineraryTab';
import PrintableItinerary from './PrintableItinerary';
import SummaryPlanContainer from './SummaryPlanContainer';
import SummaryNavigation from './SummaryNavigation';
import ItineraryLine from '../component/map/ItineraryLine';
import LocationMarker from '../component/map/LocationMarker';
import MobileItineraryWrapper from './MobileItineraryWrapper';
import Loading from './Loading';
import { getHomeUrl } from '../util/path';
import { getIntermediatePlaces } from '../util/queryUtils';
import withBreakpoint from '../util/withBreakpoint';
import { validateServiceTimeRange } from '../util/timeUtils';

export const ITINERARYFILTERING_DEFAULT = 2.0;

function getActiveIndex(state) {
  return (state && state.summaryPageSelected) || 0;
}

class SummaryPage extends React.Component {
  static contextTypes = {
    queryAggregator: PropTypes.shape({
      readyState: PropTypes.shape({
        done: PropTypes.bool.isRequired,
        error: PropTypes.string,
      }).isRequired,
    }).isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
    config: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
  };

  static propTypes = {
    printPage: PropTypes.object,
    location: PropTypes.shape({
      state: PropTypes.object,
    }).isRequired,
    params: PropTypes.shape({
      hash: PropTypes.string,
    }).isRequired,
    plan: PropTypes.shape({
      plan: PropTypes.shape({
        itineraries: PropTypes.array,
      }).isRequired,
    }).isRequired,
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    content: PropTypes.node,
    map: PropTypes.shape({
      type: PropTypes.func.isRequired,
    }).isRequired,
    from: dtLocationShape.isRequired,
    to: dtLocationShape.isRequired,
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        fullscreenMap: PropTypes.bool,
        printPage: PropTypes.object,
      }).isRequired,
    ).isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  static hcParameters = {
    walkReluctance: 2,
    walkBoardCost: 600,
    minTransferTime: 120,
    transferPenalty: 0,
    walkSpeed: 1.2,
    wheelchair: false,
    accessibilityOption: 0,
    ticketTypes: null,
  };

  constructor(props, context) {
    super(props, context);
    context.executeAction(storeOrigin, props.from);
  }

  state = { center: null, loading: false, isQuickSettingsOpen: false };

  componentWillMount() {
    this.initCustomizableParameters(this.context.config);
  }

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
    if (!isEqual(nextProps.from, this.props.from)) {
      this.context.executeAction(storeOrigin, nextProps.from);
    }

    if (nextProps.breakpoint === 'large' && this.state.center) {
      this.setState({ center: null });
    }
  }

  setLoading = loading => {
    this.setState({ loading });
  };

  setError = error => {
    this.context.queryAggregator.readyState.error = error;
  };

  updateCenter = (lat, lon) => {
    this.setState({ center: { lat, lon } });
  };

  initCustomizableParameters = config => {
    this.customizableParameters = {
      ...SummaryPage.hcParameters,
      modes: Object.keys(config.transportModes)
        .filter(mode => config.transportModes[mode].defaultValue === true)
        .map(mode => config.modeToOTP[mode])
        .concat(
          Object.keys(config.streetModes)
            .filter(mode => config.streetModes[mode].defaultValue === true)
            .map(mode => config.modeToOTP[mode]),
        )
        .sort()
        .join(','),
      maxWalkDistance: config.maxWalkDistance,
      itineraryFiltering: config.itineraryFiltering,
      preferred: { agencies: config.preferredAgency || '' },
    };
  };

  hasDefaultPreferences = () => {
    const a = pick(this.customizableParameters, keys(this.props));
    const b = pick(this.props, keys(this.customizableParameters));
    return isMatch(a, b);
  };

  toggleQuickSettingsPanel = val => {
    this.setState({ isQuickSettingsOpen: val });
  };

  renderMap() {
    const {
      plan: { plan },
      location: { state, query },
      from,
      to,
    } = this.props;
    const activeIndex = getActiveIndex(state);
    const itineraries = (plan && plan.itineraries) || [];

    const leafletObjs = sortBy(
      itineraries.map((itinerary, i) => (
        <ItineraryLine
          key={i}
          hash={i}
          legs={itinerary.legs}
          passive={i !== activeIndex}
        />
      )),
      // Make sure active line isn't rendered over
      i => i.props.passive === false,
    );

    if (from.lat && from.lon) {
      leafletObjs.push(
        <LocationMarker key="fromMarker" position={from} className="from" />,
      );
    }

    if (to.lat && to.lon) {
      leafletObjs.push(
        <LocationMarker key="toMarker" position={to} className="to" />,
      );
    }

    getIntermediatePlaces(query).forEach((location, i) => {
      leafletObjs.push(
        <LocationMarker
          key={`via_${i}`}
          position={location}
          className="via"
          noText
        />,
      );
    });

    // Decode all legs of all itineraries into latlong arrays,
    // and concatenate into one big latlong array
    const bounds = [].concat(
      [[from.lat, from.lon], [to.lat, to.lon]],
      ...itineraries.map(itinerary =>
        [].concat(
          ...itinerary.legs.map(leg => polyline.decode(leg.legGeometry.points)),
        ),
      ),
    );

    return (
      <MapContainer
        className="summary-map"
        leafletObjs={leafletObjs}
        fitBounds
        bounds={bounds}
        showScaleBar
      />
    );
  }

  render() {
    const {
      queryAggregator: {
        readyState: { done, error },
      },
    } = this.context;

    if (
      this.props.routes[this.props.routes.length - 1].printPage &&
      this.props.plan &&
      this.props.plan.plan &&
      this.props.plan.plan.itineraries
    ) {
      return React.cloneElement(this.props.content, {
        itinerary: this.props.plan.plan.itineraries[this.props.params.hash],
        focus: this.updateCenter,
      });
    }

    // Call props.map directly in order to render to same map instance
    const map = this.props.map
      ? this.props.map.type(
          {
            itinerary:
              this.props.plan.plan.itineraries &&
              this.props.plan.plan.itineraries[this.props.params.hash],
            center: this.state.center,
            ...this.props,
          },
          this.context,
        )
      : this.renderMap();

    let earliestStartTime;
    let latestArrivalTime;

    if (
      this.props.plan &&
      this.props.plan.plan &&
      this.props.plan.plan.itineraries
    ) {
      earliestStartTime = Math.min(
        ...this.props.plan.plan.itineraries.map(i => i.startTime),
      );
      latestArrivalTime = Math.max(
        ...this.props.plan.plan.itineraries.map(i => i.endTime),
      );
    }

    const serviceTimeRange = validateServiceTimeRange(
      this.props.serviceTimeRange,
    );
    const hasDefaultPreferences = this.hasDefaultPreferences();
    if (this.props.breakpoint === 'large') {
      let content;
      if (this.state.loading === false && (done || error !== null)) {
        content = (
          <SummaryPlanContainer
            plan={this.props.plan.plan}
            serviceTimeRange={serviceTimeRange}
            itineraries={this.props.plan.plan.itineraries}
            params={this.props.params}
            error={error}
            setLoading={this.setLoading}
            setError={this.setError}
          >
            {this.props.content &&
              React.cloneElement(this.props.content, {
                itinerary: this.props.plan.plan.itineraries[
                  this.props.params.hash
                ],
                focus: this.updateCenter,
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
          homeUrl={getHomeUrl(this.props.from, this.props.to)}
          header={
            <SummaryNavigation
              params={this.props.params}
              serviceTimeRange={serviceTimeRange}
              hasDefaultPreferences={hasDefaultPreferences}
              startTime={earliestStartTime}
              endTime={latestArrivalTime}
              isQuickSettingsOpen={this.state.isQuickSettingsOpen}
              toggleQuickSettings={this.toggleQuickSettingsPanel}
            />
          }
          // TODO: Chceck preferences
          content={content}
          map={map}
        />
      );
    }

    let content;

    if ((!done && !error) || this.state.loading !== false) {
      content = (
        <div style={{ position: 'relative', height: 200 }}>
          <Loading />
        </div>
      );
    } else if (this.props.params.hash) {
      content = (
        <MobileItineraryWrapper
          itineraries={this.props.plan.plan.itineraries}
          params={this.props.params}
          fullscreenMap={some(
            this.props.routes.map(route => route.fullscreenMap),
          )}
          focus={this.updateCenter}
        >
          {this.props.content &&
            this.props.plan.plan.itineraries.map((itinerary, i) =>
              React.cloneElement(this.props.content, { key: i, itinerary }),
            )}
        </MobileItineraryWrapper>
      );
    } else {
      content = (
        <SummaryPlanContainer
          plan={this.props.plan.plan}
          serviceTimeRange={serviceTimeRange}
          itineraries={this.props.plan.plan.itineraries}
          params={this.props.params}
          error={error}
          setLoading={this.setLoading}
          setError={this.setError}
        />
      );
    }

    return (
      <MobileView
        header={
          !this.props.params.hash ? (
            <SummaryNavigation
              hasDefaultPreferences={hasDefaultPreferences}
              params={this.props.params}
              serviceTimeRange={serviceTimeRange}
              startTime={earliestStartTime}
              endTime={latestArrivalTime}
              isQuickSettingsOpen={this.state.isQuickSettingsOpen}
              toggleQuickSettings={this.toggleQuickSettingsPanel}
            />
          ) : (
            false
          )
        }
        homeUrl={getHomeUrl(this.props.from, this.props.to)}
        content={content}
        map={map}
      />
    );
  }
}

export default Relay.createContainer(withBreakpoint(SummaryPage), {
  fragments: {
    plan: () => Relay.QL`
      fragment on QueryType {
        plan(
          fromPlace: $fromPlace,
          toPlace: $toPlace,
          intermediatePlaces: $intermediatePlaces,
          numItineraries: $numItineraries,
          modes: $modes,
          date: $date,
          time: $time,
          walkReluctance: $walkReluctance,
          walkBoardCost: $walkBoardCost,
          minTransferTime: $minTransferTime,
          walkSpeed: $walkSpeed,
          maxWalkDistance: $maxWalkDistance,
          wheelchair: $wheelchair,
          ticketTypes: $ticketTypes,
          disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic,
          arriveBy: $arriveBy,
          transferPenalty: $transferPenalty,
          preferred: $preferred,
          itineraryFiltering: $itineraryFiltering)
        {
          ${SummaryPlanContainer.getFragment('plan')}
          ${ItineraryTab.getFragment('searchTime')}
          itineraries {
            startTime
            endTime
            ${ItineraryTab.getFragment('itinerary')}
            ${PrintableItinerary.getFragment('itinerary')}
            ${SummaryPlanContainer.getFragment('itineraries')}
            legs {
              ${ItineraryLine.getFragment('legs')}
              transitLeg
              legGeometry {
                points
              }
            }
          }
        }
      }
    `,
    serviceTimeRange: () => Relay.QL`
      fragment on serviceTimeRange {
        start
        end
      }
    `,
  },
  initialVariables: {
    ...{
      from: null,
      to: null,
      fromPlace: null,
      toPlace: null,
      intermediatePlaces: null,
      numItineraries:
        typeof matchMedia !== 'undefined' &&
        matchMedia('(min-width: 900px)').matches
          ? 5
          : 3,
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm:ss'),
      arriveBy: false,
      disableRemainingWeightHeuristic: false,
      transferPenalty: null,
      modes: null,
      maxWalkDistance: 0,
      preferred: null,
      ticketTypes: null,
      itineraryFiltering: ITINERARYFILTERING_DEFAULT,
    },
    ...SummaryPage.hcParameters,
  },
});
