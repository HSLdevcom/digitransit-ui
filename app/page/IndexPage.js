import React from 'react';
import getContext from 'recompose/getContext';
import { clearDestination } from '../action/EndpointActions';
import FeedbackPanel from '../component/feedback/feedback-panel';
import FrontPagePanelContainer from '../component/front-page/FrontPagePanelContainer';
import MapWithTracking from '../component/map/MapWithTracking';
import SearchMainContainer from '../component/search/SearchMainContainer';
import config from '../config';

class IndexPage extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    breakpoint: React.PropTypes.string.isRequired,
    children: React.PropTypes.node,
    routes: React.PropTypes.array,
  }

  componentWillMount = () => {
    this.resetToCleanState();
  }

  componentDidMount() {
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') >= -1) {
      config.transportModes.citybike.defaultValue = true;
    }
  }

  resetToCleanState = () => {
    this.context.executeAction(clearDestination);
  }

  render() {
    return (
      <div className={`front-page fullscreen bp-${this.props.breakpoint}`} >
        <MapWithTracking breakpoint={this.props.breakpoint} showStops >
          <SearchMainContainer /></MapWithTracking>
        <FrontPagePanelContainer
          routes={this.props.routes}
        >{this.props.children}</FrontPagePanelContainer>
        <FeedbackPanel />
      </div>
    );
  }
}

const IndexPageWithBreakpoint =
    getContext({ breakpoint: React.PropTypes.string.isRequired })(IndexPage);

export default IndexPageWithBreakpoint;
