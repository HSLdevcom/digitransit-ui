import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { routerShape } from 'react-router';
import ItinerarySummaryListContainer from './ItinerarySummaryListContainer';
import TimeNavigationButtons from './TimeNavigationButtons';
import { getRoutePath } from '../util/path';
import Loading from './Loading';

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    plan: PropTypes.object.isRequired,
    itineraries: PropTypes.array.isRequired,
    children: PropTypes.node,
    error: PropTypes.string,
    params: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      hash: PropTypes.string,
    }).isRequired,
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  onSelectActive = index => {
    if (this.getActiveIndex() === index) {
      this.onSelectImmediately(index);
    } else {
      this.context.router.replace({
        ...this.context.location,
        state: { summaryPageSelected: index },
        pathname: getRoutePath(this.props.params.from, this.props.params.to),
      });
    }
  };

  onSelectImmediately = index => {
    if (Number(this.props.params.hash) === index) {
      if (this.context.breakpoint === 'large') {
        this.context.router.replace({
          ...this.context.location,
          pathname: getRoutePath(this.props.params.from, this.props.params.to),
        });
      } else {
        this.context.router.goBack();
      }
    } else {
      const newState = {
        ...this.context.location,
        state: { summaryPageSelected: index },
      };
      const basePath = getRoutePath(
        this.props.params.from,
        this.props.params.to,
      );
      const indexPath = `${getRoutePath(
        this.props.params.from,
        this.props.params.to,
      )}/${index}`;

      if (this.context.breakpoint === 'large') {
        newState.pathname = indexPath;
        this.context.router.replace(newState);
      } else {
        newState.pathname = basePath;
        this.context.router.replace(newState);
        newState.pathname = indexPath;
        this.context.router.push(newState);
      }
    }
  };

  getActiveIndex() {
    if (this.context.location.state) {
      return this.context.location.state.summaryPageSelected || 0;
    }
    /*
     * If state does not exist, for example when accessing the summary
     * page by an external link, we check if an itinerary selection is
     * supplied in URL and make that the active selection.
     */
    const lastURLSegment = this.context.location.pathname.split('/').pop();
    return isNaN(lastURLSegment) ? 0 : Number(lastURLSegment);
  }

  render() {
    const currentTime = this.context
      .getStore('TimeStore')
      .getCurrentTime()
      .valueOf();
    const activeIndex = this.getActiveIndex();
    if (!this.props.itineraries && this.props.error === null) {
      return <Loading />;
    }
    return (
      <div className="summary">
        <ItinerarySummaryListContainer
          searchTime={this.props.plan.date}
          itineraries={this.props.itineraries}
          currentTime={currentTime}
          onSelect={this.onSelectActive}
          onSelectImmediately={this.onSelectImmediately}
          activeIndex={activeIndex}
          open={Number(this.props.params.hash)}
        >
          {this.props.children}
        </ItinerarySummaryListContainer>
        <TimeNavigationButtons itineraries={this.props.itineraries} />
      </div>
    );
  }
}

export default Relay.createContainer(SummaryPlanContainer, {
  fragments: {
    plan: () => Relay.QL`
      fragment on Plan {
        date
      }
    `,
    itineraries: () => Relay.QL`
      fragment on Itinerary @relay(plural: true) {
        ${ItinerarySummaryListContainer.getFragment('itineraries')}
        endTime
        startTime
      }
    `,
  },
});
