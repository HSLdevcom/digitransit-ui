import React from 'react';
import Relay from 'react-relay';
import some from 'lodash/some';

import RouteListHeader from './RouteListHeader';
import RouteStopListContainer from './RouteStopListContainer';

class PatternStopsContainer extends React.Component {
  static propTypes = {
    pattern: React.PropTypes.shape({
      code: React.PropTypes.string.isRequired,
    }).isRequired,
    routes: React.PropTypes.arrayOf(React.PropTypes.shape({
      fullscreenMap: React.PropTypes.bool,
    }).isRequired).isRequired,
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string.isRequired,
    }).isRequired,
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    breakpoint: React.PropTypes.string.isRequired,
  }

  toggleFullscreenMap = () => {
    if (some(this.props.routes, route => route.fullscreenMap)) {
      this.context.router.goBack();
      return;
    }
    this.context.router.push(`${this.props.location.pathname}/kartta`);
  }

  render() {
    if (!this.props.pattern) return false;

    if (
      some(this.props.routes, route => route.fullscreenMap) &&
      this.context.breakpoint !== 'large'
    ) {
      return <div className="route-page-content" />;
    }

    return (
      <div className="route-page-content">
        <RouteListHeader
          key="header"
          className={this.context.breakpoint === 'large' && 'bp-large'}
        />
        <RouteStopListContainer
          key="list"
          pattern={this.props.pattern}
          patternId={this.props.pattern.code}
        />
      </div>
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
        ${RouteStopListContainer.getFragment('pattern', { patternId })}
      }
    `,
  },
});
