import React from 'react';
import getContext from 'recompose/getContext';
import { clearDestination } from '../action/EndpointActions';
import FeedbackPanel from '../component/feedback/feedback-panel';
import FrontPagePanelContainer from '../component/front-page/FrontPagePanelContainer';
import MapWithTracking from '../component/map/MapWithTracking';
import { SearchMainContainerWithBreakpoint } from '../component/search/SearchMainContainer';


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

  static defaultProps = {
    breakpoint: 'medium',
  }

  componentWillMount = () => {
    this.resetToCleanState();
  }

  componentDidMount() {
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') >= -1) {
      // this.context.executeAction(forceCitybikeState); // TODO: how to do this??
    }
  }

  resetToCleanState = () => {
    this.context.executeAction(clearDestination);
  }

  render() {
    return (
      <div className={`front-page fullscreen bp-${this.props.breakpoint}`} >
        <MapWithTracking showStops ><SearchMainContainerWithBreakpoint /></MapWithTracking>
        <FrontPagePanelContainer
          routes={this.props.routes} breakpoint={this.props.breakpoint}
        >{this.props.children}</FrontPagePanelContainer>
        <FeedbackPanel />
      </div>
    );
  }
}

const IndexPageWithBreakpoint =
    getContext({ breakpoint: React.PropTypes.string.isRequired })(IndexPage);

export default IndexPageWithBreakpoint;
