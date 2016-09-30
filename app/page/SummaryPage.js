import React from 'react';
import Relay from 'react-relay';

import moment from 'moment';
import sortBy from 'lodash/sortBy';
import polyline from 'polyline-encoded';

import DesktopView from '../component/DesktopView';
import MobileView from '../component/MobileView';
import Map from '../component/map/Map';
import ItineraryPage from './ItineraryPage';

import SummaryPlanContainer from '../component/summary/SummaryPlanContainer';
import SummaryNavigation from '../component/navigation/SummaryNavigation';
import ItineraryLine from '../component/map/ItineraryLine';
import LocationMarker from '../component/map/LocationMarker';
import MobileItineraryWrapper from '../component/itinerary/MobileItineraryWrapper';

import config from '../config';

// eslint-disable-next-line react/prop-types
function renderMap({ plan: { plan }, from, to }, activeIndex) {
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
      key="from"
      position={from}
      className="from"
    />
  );
  leafletObjs.push(
    <LocationMarker
      key="to"
      position={to}
      className="to"
    />
  );

  // Decode all legs of all itineraries into latlong arrays,
  // and concatenate into one big latlong array
  const bounds =
    [].concat([[from.lat, from.lon], [to.lat, to.lon]], ...itineraries.map((itinerary) => (
      [].concat(...itinerary.legs.map((leg) => polyline.decode(leg.legGeometry.points)))
    ))
  );

  return (
    <Map
      className="summary-map"
      leafletObjs={leafletObjs}
      fitBounds
      bounds={bounds}
    />
  );
}

function getActiveIndex(state) {
  return (state && state.summaryPageSelected) || 0;
}

function SummaryPage(props, { breakpoint, queryAggregator: { readyState: { done } } }) {
  const map = props.children && props.children.type.renderMap ?
    props.children.type.renderMap(props.plan.plan.itineraries[props.params.hash]) :
    renderMap(props, getActiveIndex(props.location.state));

  if (breakpoint === 'large') {
    let content;

    if (done) {
      content = (
        <SummaryPlanContainer itineraries={props.plan.plan.itineraries} params={props.params}>
          {props.children && React.cloneElement(
            props.children,
            { itinerary: props.plan.plan.itineraries[props.params.hash] }
          )}
        </SummaryPlanContainer>
      );
    } else {
      content = <div className="spinner-loader" />;
    }

    return (
      <DesktopView
        header={<SummaryNavigation hasDefaultPreferences />}
        content={content}
        map={map}
      />
    );
  }
  let content;

  if (!done) {
    content = <div className="spinner-loader" />;
  } else if (props.params.hash) {
    content = (
      <MobileItineraryWrapper
        itineraries={props.plan.plan.itineraries}
        params={props.params}
      >
        {props.children && props.plan.plan.itineraries.map((itinerary, i) =>
          React.cloneElement(props.children, { key: i, itinerary })
        )}
      </MobileItineraryWrapper>
    );
  } else {
    content = (
      <SummaryPlanContainer itineraries={props.plan.plan.itineraries} params={props.params} />
    );
  }

  return (
    <MobileView
      header={!props.params.hash ? <SummaryNavigation hasDefaultPreferences /> : false}
      content={content}
      map={map}
    />
  );
}

SummaryPage.propTypes = {
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
  children: React.PropTypes.node,
};

SummaryPage.contextTypes = {
  breakpoint: React.PropTypes.string.isRequired,
  queryAggregator: React.PropTypes.shape({
    readyState: React.PropTypes.shape({
      done: React.PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

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
            ${ItineraryPage.getFragment('itinerary')}
            ${SummaryPlanContainer.getFragment('itineraries')}
            legs {
              ${ItineraryLine.getFragment('legs')}
              legGeometry {
                points
              }
              from {
                lat
                lon
              }
              to {
                lat
                lon
              }
            }
          }
        }
      }
    `,
  },
  initialVariables: {
    from: null,
    to: null,
    fromPlace: null,
    toPlace: null,
    numItineraries: 3,
    modes: 'BUS,TRAM,RAIL,SUBWAY,FERRY,WALK,AIRPLANE',
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HH:mm:ss'),
    walkReluctance: 2,
    walkBoardCost: 600,
    minTransferTime: 180,
    walkSpeed: 1.2,
    wheelchair: false,
    maxWalkDistance: config.maxWalkDistance,
    preferred: { agencies: config.preferredAgency || '' },
    arriveBy: false,
    disableRemainingWeightHeuristic: false,
  },
});
