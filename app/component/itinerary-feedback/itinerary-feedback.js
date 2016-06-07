import React from 'react';
import cx from 'classnames';
import Icon from '../icon/icon';
import { intlShape, FormattedMessage } from 'react-intl';

export default class ItineraryFeedback extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    piwik: React.PropTypes.object,
  };

  constructor(args) {
    super(...args);
    this.state = {
      feedbackFormOpen: false,
      feedbackText: '',
    };
    this.updateText = this.updateText.bind(this);
    this.sendFeedback = this.sendFeedback.bind(this);
    this.toggleFeedbackForm = this.toggleFeedbackForm.bind(this);
  }

  sendFeedback() {
    this.context.piwik.setCustomVariable(3, 'feedback', this.state.feedbackText, 'page');
    this.context.piwik.trackEvent('Feedback', 'Itinerary', 'Feedback', 'submitted');
    this.setState({ feedbackText: '', feedbackFormOpen: false });
  }

  updateText(event) {
    this.setState({ feedbackText: event.target.value });
  }

  toggleFeedbackForm() {
    this.setState({ feedbackFormOpen: !this.state.feedbackFormOpen });
  }

  render() {
    const placeholder = this.context.intl.formatMessage(
      { id: 'itinerary-feedback-placeholder', defaultMessage: 'Description (optional)' });
    const buttonText = this.context.intl.formatMessage(
      { id: 'itinerary-feedback-button', defaultMessage: 'Send feedback' });
    return (
      <span className="itinerary-feedback-container">
        <button
          className={
            cx('standalone-btn itinerary-feedback-btn',
              { active: this.state.feedbackFormOpen })}
          onClick={this.toggleFeedbackForm}
        >
          <Icon img="icon-icon_speach-bubble" />
        </button>
        <div
          className={
            cx('form-container', { open: this.state.feedbackFormOpen })}
        >
          <div className="form">
            <div className="form-message">
              <FormattedMessage
                id="itinerary-feedback-message"
                defaultMessage="Could not find what you were looking for?"
              />
            </div>
            <textarea
              className="feedback-text"
              placeholder={placeholder}
              rows={3}
              maxLength={200}
              value={this.state.feedbackText}
              onChange={this.updateText}
            />
            <input
              type="button"
              className="standalone-btn"
              value={buttonText}
              onClick={this.sendFeedback}
            />
          </div>
        </div>
      </span>
    );
  }
}
