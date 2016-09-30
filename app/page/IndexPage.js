import React from 'react';
import Config from '../config';
import { clearDestination } from '../action/EndpointActions';
import { reset, forceCitybikeState } from '../action/ItinerarySearchActions';
import FeedbackPanel from '../component/feedback/feedback-panel';
import FrontPagePanel from '../component/front-page/FrontPagePanel';
import MapWithTracking from '../component/map/MapWithTracking';
import DefaultNavigation from '../component/navigation/DefaultNavigation';
import SearchMainContainer from '../component/search/SearchMainContainer';

class IndexPage extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  componentWillMount = () => {
    this.resetToCleanState();
  }

  componentDidMount() {
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') >= -1) {
      this.context.executeAction(forceCitybikeState);
    }
  }

  resetToCleanState = () => {
    this.context.executeAction(clearDestination);
    this.context.executeAction(reset);
  }

  render() {
    return (
      <div className="front-page fullscreen">
        <MapWithTracking showStops>
          <SearchMainContainer />
        </MapWithTracking>
        <FrontPagePanel />
        <FeedbackPanel />
      </div>
    );
  }
}

export default IndexPage;
