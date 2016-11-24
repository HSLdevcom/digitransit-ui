import React, { PropTypes } from 'react';
import pure from 'recompose/pure';
import { openFeedbackModal } from '../action/feedbackActions';
import FeedbackPanel from './FeedbackPanel';

const OpenFeedback = (props, context) => {
  context.executeAction(openFeedbackModal);
  return <FeedbackPanel onClose={() => context.router.goBack()} />;
};

OpenFeedback.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
};

OpenFeedback.description = () => (
  <div>
    <p>
      Opens feedback
    </p>
  </div>);

export default pure(OpenFeedback);
