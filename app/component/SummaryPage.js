import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */

import React from 'react';
import Relay from 'react-relay/classic';

import moment from 'moment';
import isMatch from 'lodash/isMatch';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import sortBy from 'lodash/sortBy';
import some from 'lodash/some';
import polyline from 'polyline-encoded';
import { FormattedMessage } from 'react-intl';

import DesktopView from '../component/DesktopView';
import MobileView from '../component/MobileView';
import Map from '../component/map/Map';
import ItineraryTab from './ItineraryTab';

import SummaryPlanContainer from './SummaryPlanContainer';
import SummaryNavigation from './SummaryNavigation';
import ItineraryLine from '../component/map/ItineraryLine';
import LocationMarker from '../component/map/LocationMarker';
import MobileItineraryWrapper from './MobileItineraryWrapper';
import { otpToLocation } from '../util/otpStrings';
import Loading from './Loading';

function getActiveIndex(state) {
  return (state && state.summaryPageSelected) || 0;
}

class SummaryPage extends React.Component {
  static contextTypes = {
    breakpoint: PropTypes.string.isRequired,
    queryAggregator: PropTypes.shape({
      readyState: PropTypes.shape({
        done: PropTypes.bool.isRequired,
        error: PropTypes.string,
      }).isRequired,
    }).isRequired,
    router: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    config: PropTypes.object,
  };

  static propTypes = {
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
    content: PropTypes.node,
    map: PropTypes.shape({
      type: PropTypes.func.isRequired,
    }),
    from: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }).isRequired,
    to: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }).isRequired,
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        fullscreenMap: PropTypes.bool,
      }).isRequired,
    ).isRequired,
  };

  static hcParameters = {
    walkReluctance: 2,
    walkBoardCost: 600,
    minTransferTime: 180,
    walkSpeed: 1.2,
    wheelchair: false,
  };

  state = { center: null };

  componentWillMount = () =>
    this.initCustomizableParameters(this.context.config);

  componentWillReceiveProps(newProps, newContext) {
    if (newContext.breakpoint === 'large' && this.state.center) {
      this.setState({ center: null });
    }
  }

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
      preferred: { agencies: config.preferredAgency || '' },
    };
  };

  updateCenter = (lat, lon) => {
    this.setState({ center: { lat, lon } });
  };

  hasDefaultPreferences = () => {
    const a = pick(this.customizableParameters, keys(this.props));
    const b = pick(this.props, keys(this.customizableParameters));
    return isMatch(a, b);
  };

  renderMap() {
    const { plan: { plan }, location: { state, query }, from, to } = this.props;
    const activeIndex = getActiveIndex(state);
    const itineraries = plan.itineraries || [];

    const leafletObjs = sortBy(
      itineraries.map((itinerary, i) =>
        <ItineraryLine
          key={i}
          hash={i}
          legs={itinerary.legs}
          passive={i !== activeIndex}
        />,
      ),
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

    if (query && query.intermediatePlaces) {
      if (Array.isArray(query.intermediatePlaces)) {
        query.intermediatePlaces.map(otpToLocation).forEach((location, i) => {
          leafletObjs.push(
            <LocationMarker
              key={`via_${i}`}
              position={location}
              className="via"
              noText
            />,
          );
        });
      } else {
        leafletObjs.push(
          <LocationMarker
            key={'via'}
            position={otpToLocation(query.intermediatePlaces)}
            className="via"
            noText
          />,
        );
      }
    }

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
      <Map
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
      breakpoint,
      queryAggregator: { readyState: { done, error } },
    } = this.context;
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

    const hasDefaultPreferences = this.hasDefaultPreferences();

    if (breakpoint === 'large') {
      let content;

      if (done || error !== null) {
        content = (
          <SummaryPlanContainer
            plan={this.props.plan.plan}
            itineraries={this.props.plan.plan.itineraries}
            params={this.props.params}
            error={error}
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
          header={
            <SummaryNavigation
              params={this.props.params}
              hasDefaultPreferences={hasDefaultPreferences}
              startTime={earliestStartTime}
              endTime={latestArrivalTime}
            />
          }
          // TODO: Chceck preferences
          content={content}
          map={map}
        />
      );
    }

    let content;

    if (!done && !error) {
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
          itineraries={this.props.plan.plan.itineraries}
          params={this.props.params}
        />
      );
    }

    return (
      <MobileView
        header={
          !this.props.params.hash
            ? <SummaryNavigation
                hasDefaultPreferences={hasDefaultPreferences}
                params={this.props.params}
                startTime={earliestStartTime}
                endTime={latestArrivalTime}
              />
            : false
        }
        content={content}
        map={map}
      />
    );
  }
}


export default Relay.createContainer(SummaryPage, {
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
          preferred: $preferred)
        {
          ${SummaryPlanContainer.getFragment('plan')}
          ${ItineraryTab.getFragment('searchTime')}
          itineraries {
            startTime
            endTime
            ${ItineraryTab.getFragment('itinerary')}
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
      modes: null,
      maxWalkDistance: 0,
      preferred: null,
      ticketTypes: null,
    },
    ...SummaryPage.hcParameters },
});
