import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import NaviMessage from '../../../../../app/component/itinerary/navigator/NaviMessage';

const baseConfig = createTestConfig();

const baseProps = {
  severity: 'INFO',
  index: 0,
  handleRemove: () => {},
  cardAnimation: 'slide-in',
};

describe('<NaviMessage />', () => {
  it('renders the message content', () => {
    const { container } = renderWithProviders(
      <NaviMessage {...baseProps}>
        <span>Hello</span>
      </NaviMessage>,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('Hello');
  });

  it('applies the configured caution color for an ALERT severity icon', () => {
    const { container } = renderWithProviders(
      <NaviMessage {...baseProps} severity="ALERT">
        <span>Hello</span>
      </NaviMessage>,
      { config: baseConfig },
    );
    expect(container.querySelector('svg')?.style.fill).toBe(
      baseConfig.colors.caution,
    );
  });

  it('applies the configured primary color for a default severity icon', () => {
    const { container } = renderWithProviders(
      <NaviMessage {...baseProps} severity="INFO">
        <span>Hello</span>
      </NaviMessage>,
      { config: baseConfig },
    );
    expect(container.querySelector('svg')?.style.fill).toBe(
      baseConfig.colors.primary,
    );
  });

  it('hides the close button when hideClose is set', () => {
    const { container } = renderWithProviders(
      <NaviMessage {...baseProps} hideClose>
        <span>Hello</span>
      </NaviMessage>,
      { config: baseConfig },
    );
    expect(container.querySelector('.info-close')).toBeNull();
  });

  it('calls handleRemove after the slide-out animation ends', () => {
    const handleRemove = vi.fn();
    const { container } = renderWithProviders(
      <NaviMessage {...baseProps} handleRemove={handleRemove}>
        <span>Hello</span>
      </NaviMessage>,
      { config: baseConfig },
    );
    fireEvent.click(container.querySelector('.info-close'));
    const item = container.querySelector('.info-stack-item');
    fireEvent.animationEnd(item);
    expect(handleRemove).toHaveBeenCalledWith(0);
  });
});
