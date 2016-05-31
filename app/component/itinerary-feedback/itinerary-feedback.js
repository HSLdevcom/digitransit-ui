import React from 'react'
import Icon from '../icon/icon'
import intl from 'react-intl'

const FormattedMessage = intl.FormattedMessage

export default class ItineraryFeedback extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intl.intlShape.isRequired,
    piwik: React.PropTypes.object
  };

  constructor(args) {
    super(...args);
    this.state = {
      voted: false
    };
  }

  rate(rating) {
    this.context.piwik.trackEvent("Feedback", "Itinerary", "Rating", rating)
    this.state.voted = true;
  }

  render() {
    return (
      <div className="itinerary-feedback">
      <div className="option" onClick={() => rate(10)}><Icon img="icon-icon_thumb-up"/></div>
      <div className="option" onClick={() => rate(1)}><Icon img="icon-icon_thumb-down"/></div>
    </div>);
  }
}
