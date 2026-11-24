import cx from 'classnames';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Feedback from './Feedback';

// Itinerary list row feedback. Unanswered feedback slides in one second after the row appears.
export default function AnimatedFeedback({ recommended, feedback, giveFeedback }) {
  const answered = feedback !== undefined;
  const [isExpanded, setIsExpanded] = useState(answered);
  // Keep overflow hidden during the animation to avoid clipping the feedback
  // frame's bottom border in Firefox.
  const [expandDone, setExpandDone] = useState(answered);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTransitionEnd = event => {
    if (event.propertyName === 'max-height' && isExpanded) {
      setExpandDone(true);
    }
  };

  return (
    <div
      className={
        answered ? '' : cx('feedback-animated', { open: isExpanded, expanded: expandDone })
      }
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={answered ? '' : 'feedback-motion'}>
        <div className="feedback-frame">
          <Feedback recommended={recommended} feedback={feedback} giveFeedback={giveFeedback} />
        </div>
      </div>
    </div>
  );
}

AnimatedFeedback.propTypes = {
  recommended: PropTypes.bool.isRequired,
  feedback: PropTypes.bool,
  giveFeedback: PropTypes.func.isRequired,
};
