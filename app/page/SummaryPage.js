import React from 'react';
import Relay from 'react-relay';

import moment from 'moment';
import sortBy from 'lodash/sortBy';
import polyline from 'polyline-encoded';

import DesktopView from '../component/DesktopView';
import MobileView from '../component/MobileView';
import Map from '../component/map/Map';

import SummaryPlanContainer from '../component/summary/SummaryPlanContainer';
import SummaryNavigation from '../component/navigation/SummaryNavigation';
import ItineraryLine from '../component/map/ItineraryLine';

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
        showFromToMarkers={i === 0}
        passive={i !== activeIndex}
      />
    )),
    // Make sure active line isn't rendered over
    i => i.props.passive === false);

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

function SummaryPage(props, { breakpoint }) {
  const header = <SummaryNavigation hasDefaultPreferences />;
  const map = renderMap(props, getActiveIndex(props.location.state));

  if (breakpoint === 'large') {
    return (
      <DesktopView
        header={header}
        content={<SummaryPlanContainer itineraries={props.plan.plan.itineraries} />}
        map={map}
      />
    );
  }
  return (
    <MobileView
      header={header}
      content={<SummaryPlanContainer itineraries={props.plan.plan.itineraries} />}
      map={map}
    />
  );
}

SummaryPage.propTypes = {
  location: React.PropTypes.shape({
    state: React.PropTypes.object,
  }).isRequired,
};

SummaryPage.contextTypes = {
  breakpoint: React.PropTypes.string.isRequired,
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
            ${SummaryPlanContainer.getFragment('itineraries')}
            legs {
              mode
              legGeometry {
                points
              }
              from {
                vertexType
                stop {
                  gtfsId
                }
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
