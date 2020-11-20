import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { matchShape, routerShape } from 'found';
import cx from 'classnames';
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

  static contextTypes = {
    config: PropTypes.object.isRequired,
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
      this.props.match.location.state &&
      this.props.match.location.state.fullscreenMap &&
      this.props.breakpoint !== 'large'
    ) {
      return <div className="route-page-content" />;
    }

    return (
      <div
        className={cx('route-page-content', {
          'bp-large': this.props.breakpoint === 'large',
        })}
      >
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

export default createFragmentContainer(withBreakpoint(PatternStopsContainer), {
  pattern: graphql`
    fragment PatternStopsContainer_pattern on Pattern
    @argumentDefinitions(
      currentTime: { type: "Long!", defaultValue: 0 }
      patternId: { type: "String!", defaultValue: "0" }
    ) {
      code
      ...RouteStopListContainer_pattern
      @arguments(currentTime: $currentTime, patternId: $patternId)
    }
  `,
});
