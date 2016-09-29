import React from 'react';
import Relay from 'react-relay';

import ItinerarySummaryListContainer from './ItinerarySummaryListContainer';
import TimeNavigationButtons from './TimeNavigationButtons';

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    itineraries: React.PropTypes.array.isRequired,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  onSelectActive = index => {
    if (this.getActiveIndex() === index) {
      this.context.router.push(`${this.context.location.pathname}/${index}`);
    } else {
      this.context.router.replace({
        ...this.context.location,
        state: { summaryPageSelected: index },
      });
    }
  }

  getActiveIndex() {
    const state = this.context.location.state || {};
    return state.summaryPageSelected || 0;
  }

  render() {
    const currentTime = this.context.getStore('TimeStore').getCurrentTime().valueOf();
    const activeIndex = this.getActiveIndex();

    return (
      <div className="summary">
        <ItinerarySummaryListContainer
          itineraries={this.props.itineraries}
          currentTime={currentTime}
          onSelect={this.onSelectActive}
          activeIndex={activeIndex}
        />
        <TimeNavigationButtons itineraries={this.props.itineraries} />
      </div>
    );
  }
}

export default Relay.createContainer(SummaryPlanContainer, {
  fragments: {
    itineraries: () => Relay.QL`
      fragment on Itinerary @relay(plural: true) {
        ${ItinerarySummaryListContainer.getFragment('itineraries')}
        endTime
        startTime
      }
    `,
  },
});
