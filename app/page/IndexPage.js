import React from 'react';
import getContext from 'recompose/getContext';
import { clearDestination } from '../action/EndpointActions';
import { reset, forceCitybikeState } from '../action/ItinerarySearchActions';
import { unsetSelectedTime } from '../action/TimeActions';
import FeedbackPanel from '../component/feedback/feedback-panel';
import FrontPagePanelContainer from '../component/front-page/FrontPagePanelContainer';
import MapWithTracking from '../component/map/MapWithTracking';
import SearchMainContainer from '../component/search/SearchMainContainer';


class IndexPage extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    breakpoint: React.PropTypes.string.isRequired,
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
      this.context.executeAction(forceCitybikeState);
    }
  }

  resetToCleanState = () => {
    this.context.executeAction(clearDestination);
    this.context.executeAction(unsetSelectedTime);
    this.context.executeAction(reset);
  }

  largeStyle = {
    maxWidth: 'none',
    height: 'calc(100% - 80px)',
    zIndex: 401,
    position: 'absolute',
    top: 30,
  };

  render() {
    return (
      ((this.props.breakpoint !== 'large') && // 'small & medium'
      (
        <div className={'front-page fullscreen'} >
          <MapWithTracking showStops >
            <SearchMainContainer />
          </MapWithTracking>
          <FrontPagePanelContainer breakpoint="medium" />
          <FeedbackPanel />
        </div>
      )) || // 'large'
      (
        <div className={`front-page fullscreen bp-${this.props.breakpoint}`} >
          <MapWithTracking showStops />
          <div
            style={{
              position: 'absolute',
              top: '30px',
              right: 0,
              paddingLeft: '50px',
              paddingRight: '400px',
              paddingTop: 0,
              width: '100%',
            }}
          ><SearchMainContainer /></div>
          <FrontPagePanelContainer
            breakpoint="large"
          />
        </div>
    )); }
}

const IndexPageWithBreakpoint =
    getContext({ breakpoint: React.PropTypes.string.isRequired })(IndexPage);

export { IndexPageWithBreakpoint as default, IndexPage };
