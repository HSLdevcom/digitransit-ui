import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import some from 'lodash/some';
import { routerShape } from 'react-router';
import RouteListHeader from './RouteListHeader';
import RouteStopListContainer from './RouteStopListContainer';
import withBreakpoint from '../util/withBreakpoint';

class PatternStopsContainer extends React.PureComponent {
  static propTypes = {
    pattern: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }).isRequired,
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        fullscreenMap: PropTypes.bool,
      }).isRequired,
    ).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  static contextTypes = {
    router: routerShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  toggleFullscreenMap = () => {
    if (some(this.props.routes, route => route.fullscreenMap)) {
      this.context.router.goBack();
      return;
    }
    this.context.router.push(`${this.props.location.pathname}/kartta`);
  };

  render() {
    if (!this.props.pattern) {
      return false;
    }

    if (
      some(this.props.routes, route => route.fullscreenMap) &&
      this.props.breakpoint !== 'large'
    ) {
      return <div className="route-page-content" />;
    }

    return (
      <div className="route-page-content">
        <RouteListHeader
          key="header"
          displayNextDeparture={this.context.config.displayNextDeparture}
          className={`bp-${this.props.breakpoint}`}
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

export default Relay.createContainer(withBreakpoint(PatternStopsContainer), {
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
