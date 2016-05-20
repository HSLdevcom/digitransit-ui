import React from 'react';
import Config from '../config';
import DefaultNavigation from '../component/navigation/DefaultNavigation';
import FrontPagePanel from '../component/front-page/FrontPagePanel';
import SearchMainContainer from '../component/search/search-main-container';
import MapWithTracking from '../component/map/MapWithTracking';
import FeedbackPanel from '../component/feedback/feedback-panel';
import { clearDestination } from '../action/EndpointActions';
import { unsetSelectedTime } from '../action/TimeActions';
import { reset, forceCitybikeState } from '../action/ItinerarySearchActions';

class IndexPage extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  constructor(args) {
    super(...args);
    this.resetToCleanState = this.resetToCleanState.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
  }

  componentWillMount() {
    this.resetToCleanState();
  }

  componentDidMount() {
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') >= -1) {
      this.context.executeAction(forceCitybikeState);
    }
  }

  resetToCleanState() {
    this.context.executeAction(clearDestination);
    this.context.executeAction(unsetSelectedTime);
    this.context.executeAction(reset);
  }

  render() {
    return (
      <DefaultNavigation
        className="front-page fullscreen"
        disableBackButton
        showDisruptionInfo
        title={Config.title}
      >
        <MapWithTracking showStops>
          <SearchMainContainer />
        </MapWithTracking>
        <FrontPagePanel />
        <FeedbackPanel />
      </DefaultNavigation>
    );
  }
}

export default IndexPage;
