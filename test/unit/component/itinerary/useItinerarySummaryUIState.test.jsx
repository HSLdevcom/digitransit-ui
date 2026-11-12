import PropTypes from 'prop-types';
import { act, fireEvent, render } from '@testing-library/react';
import useItinerarySummaryUIState from '../../../../app/component/itinerary/useItinerarySummaryUIState';

const UIStateProbe = ({ gotFeedback = false }) => {
  const {
    itineraryContainerOverflowRef,
    showOverflowIcon,
    isExpanded,
    feedbackExpandDone,
    handleFeedbackTransitionEnd,
  } = useItinerarySummaryUIState(gotFeedback);

  return (
    <div
      ref={itineraryContainerOverflowRef}
      className={[
        isExpanded && 'open',
        feedbackExpandDone && 'expanded',
        showOverflowIcon && 'overflow-icon',
      ]
        .filter(Boolean)
        .join(' ')}
      onTransitionEnd={handleFeedbackTransitionEnd}
    />
  );
};

UIStateProbe.propTypes = {
  gotFeedback: PropTypes.bool,
};

describe('useItinerarySummaryUIState', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('expands unanswered feedback after one second and completes its transition', () => {
    vi.useFakeTimers();
    const { container } = render(<UIStateProbe />);
    const element = container.firstElementChild;

    expect(element.className).toBe('');
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(element.className).toBe('');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(element.className).toBe('open');

    const transitionEnd = propertyName => {
      const event = new Event('transitionend', { bubbles: true });
      Object.defineProperty(event, 'propertyName', { value: propertyName });
      fireEvent(element, event);
    };

    transitionEnd('opacity');
    expect(element.className).toBe('open');
    transitionEnd('max-height');
    expect(element.className).toBe('open expanded');
  });

  it('starts expanded when feedback has already been submitted', () => {
    const { container } = render(<UIStateProbe gotFeedback />);

    expect(container.firstElementChild.className).toBe('open expanded');
  });

  it('shows the overflow icon only when the legs exceed their container', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(101);
    const { container } = render(<UIStateProbe />);

    expect(container.firstElementChild.className).toBe('overflow-icon');
  });
});
