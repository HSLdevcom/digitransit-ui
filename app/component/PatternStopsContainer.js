import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import some from 'lodash/some';
import { matchShape, routerShape } from 'found';
import RouteListHeader from './RouteListHeader';
import RouteStopListContainer from './RouteStopListContainer';
import withBreakpoint from '../util/withBreakpoint';

class PatternStopsContainer extends React.PureComponent {
  static propTypes = {
    pattern: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }).isRequired,
    match: matchShape.isRequired,
    breakpoint: PropTypes.string.isRequired,
    router: routerShape.isRequired,
  };

  toggleFullscreenMap = () => {
    if (
      this.props.match.location.state &&
      this.props.match.location.state.fullscreenMap === true
    ) {
      this.props.router.go(-1);
      return;
    }
    this.props.router.push({
      ...this.props.match.location,
      state: { ...this.props.match.location.state, fullscreenMap: true },
    });
  };

  render() {
    if (!this.props.pattern) {
      return false;
    }

    if (
      some(
        this.props.match.location.state &&
          this.props.match.location.state.fullscreenMap === true,
      ) &&
      this.props.breakpoint !== 'large'
    ) {
      return <div className="route-page-content" />;
    }

    return (
      <div className="route-page-content">
        <RouteListHeader
          key="header"
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

export default createFragmentContainer(withBreakpoint(PatternStopsContainer), {
  pattern: graphql`
    fragment PatternStopsContainer_pattern on Pattern {
      code
      ...RouteStopListContainer_pattern
    }
  `,
});
