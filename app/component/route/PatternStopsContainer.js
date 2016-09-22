import React from 'react';
import Relay from 'react-relay';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import RouteListHeader from './RouteListHeader';
import RouteStopListContainer from './RouteStopListContainer';
import RouteMapContainer from './RouteMapContainer';


class PatternStopsContainer extends React.Component {
  static propTypes = {
    pattern: React.PropTypes.shape({
      code: React.PropTypes.string.isRequired,
    }).isRequired,
    route: React.PropTypes.shape({
      fullscreenMap: React.PropTypes.bool,
    }).isRequired,
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string.isRequired,
    }).isRequired,
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  toggleFullscreenMap = () => {
    if (this.props.route.fullscreenMap) {
      this.context.router.goBack();
      return;
    }
    this.context.router.push(`${this.props.location.pathname}/kartta`);
  }

  render() {
    let mainContent = null;

    if (!this.props.route.fullscreenMap) {
      mainContent = ([
        <RouteListHeader key="header" />,
        <RouteStopListContainer
          key="list"
          pattern={this.props.pattern}
          patternId={this.props.pattern.code}
        />,
      ]);
    }

    return (
      <ReactCSSTransitionGroup
        component="div"
        className="route-page-content"
        transitionName="route-page-content"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
      >
        <RouteMapContainer
          key="map"
          pattern={this.props.pattern}
          toggleFullscreenMap={this.toggleFullscreenMap}
          className="routeMap full"
          useSmallIcons
        >
          {!this.props.route.fullscreenMap ?
            <div className="map-click-prevent-overlay" onClick={this.toggleFullscreenMap} /> :
            null
          }
        </RouteMapContainer>
        {mainContent}
      </ReactCSSTransitionGroup>
    );
  }
}

export default Relay.createContainer(PatternStopsContainer, {
  initialVariables: {
    patternId: null,
  },
  fragments: {
    pattern: ({ patternId }) =>
      Relay.QL`
      fragment on Pattern {
        code
        ${RouteMapContainer.getFragment('pattern')}
        ${RouteStopListContainer.getFragment('pattern', { patternId })}
      }
    `,
  },
});
