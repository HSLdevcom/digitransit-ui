import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export default function useItinerarySummaryUIState(gotFeedback) {
  const itineraryContainerOverflowRef = useRef(null);
  const [showOverflowIcon, setShowOverflowIcon] = useState(false);
  const [isExpanded, setIsExpanded] = useState(gotFeedback);
  // Keep overflow hidden during the animation to avoid clipping the feedback
  // frame's bottom border in Firefox.
  const [feedbackExpandDone, setFeedbackExpandDone] = useState(gotFeedback);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    const container = itineraryContainerOverflowRef.current;
    if (container) {
      setShowOverflowIcon(container.clientWidth < container.scrollWidth);
    }
  }, []);

  const handleFeedbackTransitionEnd = event => {
    if (event.propertyName === 'max-height' && isExpanded) {
      setFeedbackExpandDone(true);
    }
  };

  return {
    itineraryContainerOverflowRef,
    showOverflowIcon,
    isExpanded,
    feedbackExpandDone,
    handleFeedbackTransitionEnd,
  };
}
