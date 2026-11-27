import { act, fireEvent, render } from '@testing-library/react';
import * as FeedbackModule from '../../../../../src/client/component/itinerary/Feedback';
import AnimatedFeedback from '../../../../../src/client/component/itinerary/AnimatedFeedback';

const renderFeedback = feedback =>
  render(<AnimatedFeedback recommended feedback={feedback} giveFeedback={() => {}} />);

describe('AnimatedFeedback', () => {
  beforeEach(() => {
    vi.spyOn(FeedbackModule, 'default').mockImplementation(() => <div data-testid="feedback" />);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('expands unanswered feedback after one second and completes its transition', () => {
    vi.useFakeTimers();
    const { container } = renderFeedback(undefined);
    const element = container.firstElementChild;

    expect(element.className).toBe('feedback-animated');
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(element.className).toBe('feedback-animated');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(element.className).toBe('feedback-animated open');

    const transitionEnd = propertyName => {
      const event = new Event('transitionend', { bubbles: true });
      Object.defineProperty(event, 'propertyName', { value: propertyName });
      fireEvent(element, event);
    };

    transitionEnd('opacity');
    expect(element.className).toBe('feedback-animated open');
    transitionEnd('max-height');
    expect(element.className).toBe('feedback-animated open expanded');
  });

  it('renders without animation classes when feedback has already been given', () => {
    const { container, getByTestId } = renderFeedback(true);

    expect(container.firstElementChild.className).toBe('');
    expect(getByTestId('feedback')).toBeTruthy();
  });
});
