/* eslint-disable react/no-array-index-key */

import React from 'react';
import Relay from 'react-relay';

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

import config from '../config';

function getActiveIndex(state) {
  return (state && state.summaryPageSelected) || 0;
}

class SummaryPage extends React.Component {
  static contextTypes = {
    breakpoint: React.PropTypes.string.isRequired,
    queryAggregator: React.PropTypes.shape({
      readyState: React.PropTypes.shape({
        done: React.PropTypes.bool.isRequired,
      }).isRequired,
    }).isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    location: React.PropTypes.shape({
      state: React.PropTypes.object,
    }).isRequired,
    params: React.PropTypes.shape({
      hash: React.PropTypes.string,
    }).isRequired,
    plan: React.PropTypes.shape({
      plan: React.PropTypes.shape({
        itineraries: React.PropTypes.array,
      }).isRequired,
    }).isRequired,
    content: React.PropTypes.node,
    map: React.PropTypes.shape({
      type: React.PropTypes.func.isRequired,
    }),
    from: React.PropTypes.shape({
      lat: React.PropTypes.number.isRequired,
      lon: React.PropTypes.number.isRequired,
    }).isRequired,
    to: React.PropTypes.shape({
      lat: React.PropTypes.number.isRequired,
      lon: React.PropTypes.number.isRequired,
    }).isRequired,
    routes: React.PropTypes.arrayOf(React.PropTypes.shape({
      fullscreenMap: React.PropTypes.bool,
    }).isRequired).isRequired,
  };

  static customizableParameters = {
    modes: Object.keys(config.transportModes)
      .filter(mode => config.transportModes[mode].defaultValue === true)
      .map(mode => config.modeToOTP[mode])
      .concat((Object.keys(config.streetModes)
        .filter(mode => config.streetModes[mode].defaultValue === true)
        .map(mode => config.modeToOTP[mode])))


      .sort()
      .join(','),
    walkReluctance: 2,
    walkBoardCost: 600,
    minTransferTime: 180,
    walkSpeed: 1.2,
    wheelchair: false,
    maxWalkDistance: config.maxWalkDistance,
    preferred: { agencies: config.preferredAgency || '' },
  };

  state = { center: null }

  componentWillReceiveProps(newProps, newContext) {
    if (newContext.breakpoint === 'large' && this.state.center) {
      this.setState({ center: null });
    }
  }

  updateCenter = (lat, lon) => this.setState({ center: { lat, lon } })

  hasDefaultPreferences = () => {
    const a = pick(SummaryPage.customizableParameters, keys(this.props));
    const b = pick(this.props, keys(SummaryPage.customizableParameters));
    return isMatch(a, b);
  }
  renderMap() {
    const { plan: { plan }, location: { state }, from, to } = this.props;
    const activeIndex = getActiveIndex(state);
    const itineraries = plan.itineraries || [];

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
      i => i.props.passive === false);

    leafletObjs.push(
      <LocationMarker
        key="fromMarker"
        position={from}
        className="from"
      />,
    );
    leafletObjs.push(
      <LocationMarker
        key="toMarker"
        position={to}
        className="to"
      />,
    );

    // Decode all legs of all itineraries into latlong arrays,
    // and concatenate into one big latlong array
    const bounds =
      [].concat([[from.lat, from.lon], [to.lat, to.lon]], ...itineraries.map(itinerary => (
        [].concat(...itinerary.legs.map(leg => polyline.decode(leg.legGeometry.points)))
      )),
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
    const { breakpoint, queryAggregator: { readyState: { done } } } = this.context;
    // Call props.map directly in order to render to same map instance
    const map = this.props.map ? this.props.map.type({
      itinerary: this.props.plan.plan.itineraries &&
        this.props.plan.plan.itineraries[this.props.params.hash],
      center: this.state.center,
      ...this.props,
    }, this.context) : this.renderMap();

    const hasDefaultPreferences = this.hasDefaultPreferences();

    if (breakpoint === 'large') {
      let content;

      if (done) {
        content = (
          <SummaryPlanContainer
            itineraries={this.props.plan.plan.itineraries}
            params={this.props.params}
          >
            {this.props.content && React.cloneElement(
              this.props.content,
              {
                itinerary: this.props.plan.plan.itineraries[this.props.params.hash],
                focus: this.updateCenter,
              },
            )}
          </SummaryPlanContainer>
        );
      } else {
        content = (
          <div style={{ position: 'relative', height: 200 }}>
            <div className="spinner-loader" />
          </div>
        );
      }

      return (
        <DesktopView
          title={(
            <FormattedMessage
              id="summary-page.title"
              defaultMessage="Itinerary suggestions"
            />
          )}
          header={<SummaryNavigation
            params={this.props.params} hasDefaultPreferences={hasDefaultPreferences}
          />}
          // TODO: Chceck preferences
          content={content}
          map={map}
        />
      );
    }

    let content;

    if (!done) {
      content = (
        <div style={{ position: 'relative', height: 200 }}>
          <div className="spinner-loader" />
        </div>
      );
    } else if (this.props.params.hash) {
      content = (
        <MobileItineraryWrapper
          itineraries={this.props.plan.plan.itineraries}
          params={this.props.params}
          fullscreenMap={some(this.props.routes.map(route => route.fullscreenMap))}
          focus={this.updateCenter}
        >
          {this.props.content && this.props.plan.plan.itineraries.map((itinerary, i) =>
            React.cloneElement(this.props.content, { key: i, itinerary }),
          )}
        </MobileItineraryWrapper>
      );
    } else {
      content = (
        <SummaryPlanContainer
          itineraries={this.props.plan.plan.itineraries}
          params={this.props.params}
        />
      );
    }

    return (
      <MobileView
        header={!this.props.params.hash ?
          <SummaryNavigation
            hasDefaultPreferences={hasDefaultPreferences} params={this.props.params}
          /> : false}
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
          disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic,
          arriveBy: $arriveBy,
          preferred: $preferred)
        {
          itineraries {
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
  initialVariables: { ...{
    from: null,
    to: null,
    fromPlace: null,
    toPlace: null,
    numItineraries: typeof matchMedia !== 'undefined' &&
      matchMedia('(min-width: 900px)').matches ? 5 : 3,
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HH:mm:ss'),
    preferred: { agencies: config.preferredAgency || '' },
    arriveBy: false,
    disableRemainingWeightHeuristic: false,
  },
    ...SummaryPage.customizableParameters },
});
