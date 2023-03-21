import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

const RoutingFeedbackPrompt = (props, { config }) => {
  return config.useRoutingFeedbackPrompt ? (
    <div
      style={{
        backgroundColor: '#f4f4f4',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '15px' }}>
        <FormattedMessage id="routing-feedback-header" />
      </div>
      <a
        href="https://link.webropol.com/s/otp2"
        style={{
          background: 'white',
          width: '60%',
          borderRadius: '50vh',
          padding: '5px',
          color: '#007ac9',
          border: '1px solid #888',
          textAlign: 'center',
          textDecoration: 'none',
          marginBottom: '30px',
        }}
      >
        <FormattedMessage id="routing-feedback-link" />
      </a>
    </div>
  ) : null;
};

RoutingFeedbackPrompt.contextTypes = {
  config: PropTypes.object,
};

export default RoutingFeedbackPrompt;
