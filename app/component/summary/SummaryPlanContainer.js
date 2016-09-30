import React from 'react';
import Relay from 'react-relay';

import ItinerarySummaryListContainer from './ItinerarySummaryListContainer';
import TimeNavigationButtons from './TimeNavigationButtons';

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    itineraries: React.PropTypes.array.isRequired,
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
  };

  onSelectActive = index => {
    if (this.getActiveIndex() === index) {
      if (Number(this.props.params.hash) === index) {
        this.context.router.goBack();
      } else {
        this.context.router.push({
          ...this.context.location,
          pathname: `/reitti/${this.props.params.from}/${this.props.params.to}/${index}`,
        });
      }
    } else {
      this.context.router.replace({
        ...this.context.location,
        state: { summaryPageSelected: index },
        pathname: `/reitti/${this.props.params.from}/${this.props.params.to}`,
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
    if (!this.props.itineraries) {
      return <div className="spinner-loader" />;
    }

    return (
      <div className="summary">
        <ItinerarySummaryListContainer
          itineraries={this.props.itineraries}
          currentTime={currentTime}
          onSelect={this.onSelectActive}
          activeIndex={activeIndex}
          open={this.props.params.hash}
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
    itineraries: () => Relay.QL`
      fragment on Itinerary @relay(plural: true) {
        ${ItinerarySummaryListContainer.getFragment('itineraries')}
        endTime
        startTime
      }
    `,
  },
});
