import React, { PropTypes } from 'react';
import TicketInformation from './TicketInformation';
import RouteInformation from './RouteInformation';
import ItinerarySummary from './itinerary-summary';
import TimeFrame from './time-frame';
import config from '../../config';
import ItineraryLegs from './legs/ItineraryLegs';

const routeInformation = config.showRouteInformation && <RouteInformation />;

class ItineraryTab extends React.Component {
  static propTypes = {
    itinerary: PropTypes.object.isRequired,
    focus: PropTypes.func.isRequired,
  };

  state = {
    fullscreen: false,
    lat: undefined,
    lon: undefined,
  };

  shouldComponentUpdate = () => false

  getState = () => ({
    lat: this.state.lat,
    lon: this.state.lon,
  });

  handleFocus = (lat, lon) => {
    this.props.focus(lat, lon);

    return this.setState({
      lat,
      lon,
    });
  }

  render() {
    return (
      <div className="itinerary-tab">
        <ItinerarySummary itinerary={this.props.itinerary}>
          <TimeFrame
            startTime={this.props.itinerary.startTime}
            endTime={this.props.itinerary.endTime}
            className="timeframe--itinerary-summary"
          />
        </ItinerarySummary>
        <div className="momentum-scroll itinerary-tabs__scroll">
          <div className="itinerary-main">
            <ItineraryLegs
              itinerary={this.props.itinerary}
              focusMap={this.handleFocus}
            />
            {config.showTicketInformation &&
              <TicketInformation fares={this.props.itinerary.fares} />}
            {routeInformation}
          </div>
        </div>
      </div>
    );
  }
}

export default ItineraryTab;
