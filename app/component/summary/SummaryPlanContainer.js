import React from 'react';
import Relay from 'react-relay';
import ItinerarySummaryListContainer from './itinerary-summary-list-container';
import TimeNavigationButtons from './TimeNavigationButtons';
import LocationMarker from '../map/location-marker';
import Map from '../map/map';
import ItineraryLine from '../map/ItineraryLine';

import { supportsHistory } from 'history/lib/DOMUtils';

import sortBy from 'lodash/sortBy';
import moment from 'moment';
import config from '../../config';

import { ItineraryPlanContainerFragments } from '../itinerary/ItineraryPlanContainer';

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    from: React.PropTypes.shape({
      lat: React.PropTypes.number.isRequired,
      lon: React.PropTypes.number.isRequired,
    }).isRequired,
    to: React.PropTypes.shape({
      lat: React.PropTypes.number.isRequired,
      lon: React.PropTypes.number.isRequired,
    }).isRequired,
    plan: React.PropTypes.shape({
      plan: React.PropTypes.shape({
        itineraries: React.PropTypes.array.isRequired,
      }).isRequired,
    }).isRequired,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  onSelectActive = index => {
    if (this.getActiveIndex() === index) {
      this.context.router.push(`${this.context.location.pathname}/${index}`);
    } else if (supportsHistory()) {
      this.context.router.replace({
        state: { summaryPageSelected: index },
        pathname: this.context.location.pathname,
      });
    } else {
      this.setState({ summaryPageSelected: index });
    }
  }

  getActiveIndex() {
    const state = this.context.location.state ? this.context.location.state : this.state || {};
    return state.summaryPageSelected != null ? state.summaryPageSelected : 0;
  }

  render() {
    const from = [this.props.from.lat, this.props.from.lon];
    const to = [this.props.to.lat, this.props.to.lon];
    const currentTime = this.context.getStore('TimeStore').getCurrentTime().valueOf();
    let leafletObjs = [];

    if (this.props.plan && this.props.plan.plan && this.props.plan.plan.itineraries.length > 0) {
      const plan = this.props.plan.plan;
      const activeIndex = this.getActiveIndex();

      leafletObjs = plan.itineraries.map((itinerary, i) => (
        <ItineraryLine
          key={i}
          hash={i}
          legs={itinerary.legs}
          showFromToMarkers={i === 0}
          passive={i !== activeIndex}
        />
      ));

      leafletObjs = sortBy(leafletObjs, i => i.props.passive === false);

      return (
        <div className="summary">
          <Map
            ref="map"
            className="summaryMap"
            leafletObjs={leafletObjs}
            fitBounds
            from={from}
            to={to}
          />
          <ItinerarySummaryListContainer
            itineraries={plan.itineraries}
            currentTime={currentTime}
            onSelect={this.onSelectActive}
            activeIndex={activeIndex}
          />
          <TimeNavigationButtons plan={plan} />
        </div>
      );
    }

    leafletObjs.push(<LocationMarker key="from" position={from} className="from" />);
    leafletObjs.push(<LocationMarker key="to" position={to} className="to" />);

    return (
      <div className="summary">
        <Map
          ref="map"
          className="summaryMap"
          leafletObjs={leafletObjs}
          fitBounds
          from={from}
          to={to}
        />
        <ItinerarySummaryListContainer
          itineraries={[]}
          currentTime={currentTime}
          onSelect={() => {}}
          activeIndex={0}
        />
      </div>
    );
  }
}

export default Relay.createContainer(SummaryPlanContainer, {
  fragments: ItineraryPlanContainerFragments,

  initialVariables: {
    from: null,
    to: null,
    fromPlace: null,
    toPlace: null,
    numItineraries: 3,
    modes: 'BUS,TRAM,RAIL,SUBWAY,FERRY,WALK',
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HH:mm:ss'),
    walkReluctance: 2.0001,
    walkBoardCost: 600,
    minTransferTime: 180,
    walkSpeed: 1.2,
    wheelchair: false,
    maxWalkDistance: config.maxWalkDistance + 0.1,
    preferred: { agencies: config.preferredAgency || '' },
    arriveBy: true,
    disableRemainingWeightHeuristic: false,
  },
});
