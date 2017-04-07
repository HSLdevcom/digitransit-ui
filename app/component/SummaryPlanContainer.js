import React from 'react';
import Relay from 'react-relay';

import ItinerarySummaryListContainer from './ItinerarySummaryListContainer';
import TimeNavigationButtons from './TimeNavigationButtons';
import { getRoutePath } from '../util/path';
import Loading from './Loading';

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    plan: React.PropTypes.object.isRequired,
    itineraries: React.PropTypes.array.isRequired,
    children: React.PropTypes.node,
    params: React.PropTypes.shape({
      from: React.PropTypes.string.isRequired,
      to: React.PropTypes.string.isRequired,
      hash: React.PropTypes.string,
    }).isRequired,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    breakpoint: React.PropTypes.string.isRequired,
  };

  onSelectActive = (index) => {
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

  onSelectImmediately = (index) => {
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
      const basePath = getRoutePath(this.props.params.from, this.props.params.to);
      const indexPath = `${getRoutePath(this.props.params.from, this.props.params.to)}/${index}`;

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
  }

  getActiveIndex() {
    const state = this.context.location.state || {};
    return state.summaryPageSelected || 0;
  }

  render() {
    const currentTime = this.context.getStore('TimeStore').getCurrentTime().valueOf();
    const activeIndex = this.getActiveIndex();
    if (!this.props.itineraries) {
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
