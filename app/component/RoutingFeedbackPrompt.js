import React from 'react';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../util/shapes';

const RoutingFeedbackPrompt = (props, { config }) => {
  return config.useRoutingFeedbackPrompt ? (
    <div className="routing-feedback-container">
      <div className="routing-feedback-header-container">
        <FormattedMessage id="routing-feedback-header" />
      </div>
      <a
        className="routing-feedback-link"
        href="https://link.webropol.com/s/otp2"
        target="_blank"
        rel="noreferrer"
      >
        <FormattedMessage id="routing-feedback-link" />
      </a>
    </div>
  ) : null;
};

RoutingFeedbackPrompt.contextTypes = {
  config: configShape,
};

export default RoutingFeedbackPrompt;
