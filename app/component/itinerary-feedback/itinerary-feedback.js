import React from 'react';
import intl from 'react-intl';
import cx from 'classnames';

export default class ItineraryFeedback extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intl.intlShape.isRequired,
    piwik: React.PropTypes.object,
  };

  constructor(args) {
    super(...args);
    this.state = {
      submitted: false,
      feedbackText: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendFeedback = this.sendFeedback.bind(this);
  }

  sendFeedback() {
    //this.context.piwik.getPac.push('setCustomDimension', 1, this.state.feedbackText);
    this.context.piwik.setCustomVariable(3, 'feedback', this.state.feedbackText, 'page');
    this.context.piwik.trackEvent("Feedback", "Itinerary", "Feedback", "submitted");
    this.setState({submitted: true});
  }

  handleChange(event) {
    this.state.feedbackText = event.target.value;
  }

  render() {
    return (
      <div className='itinerary-feedback'>
          <div className={cx('form', {'submitted': this.state.submitted})}>
            <input
              type="text"
              value={this.state.value}
              onChange={this.handleChange} />
            <input
              type="button"
              value="Send tilbakemelding"
              onClick={this.sendFeedback} />
          </div>
          <div className={cx('done', {'submitted': this.state.submitted})}>
            Takk!
          </div>
      </div>
    );
  }
}
