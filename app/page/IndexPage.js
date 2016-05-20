import React from 'react';
import Config from '../config';
import DefaultNavigation from '../component/navigation/DefaultNavigation';
import FrontPagePanel from '../component/front-page/front-page-panel';
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
    return this.resetToCleanState();
  }

  componentDidMount() {
    const ref = this.context.location.search;

    if (ref != null && ref.indexOf('citybikes') >= -1) {
      return this.context.executeAction(forceCitybikeState);
    }

    return undefined;
  }

  resetToCleanState() {
    this.context.executeAction(clearDestination);
    this.context.executeAction(unsetSelectedTime);
    return this.context.executeAction(reset);
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
