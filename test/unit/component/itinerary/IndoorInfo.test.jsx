import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import IndoorInfo from '../../../../app/component/itinerary/IndoorInfo';

const baseConfig = createTestConfig();

describe('<IndoorInfo />', () => {
  it('shows the "indoor route" message by default', () => {
    const { container } = renderWithProviders(
      <IndoorInfo intermediateStepCount={2} toggleFunction={() => {}} />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('Indoor route');
  });

  it('shows the "hide" message when steps are expanded', () => {
    const { container } = renderWithProviders(
      <IndoorInfo
        intermediateStepCount={2}
        showIntermediateSteps
        toggleFunction={() => {}}
      />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('Hide the indoor route');
  });

  // Proves useConfigContext() (migrated from legacy contextTypes) actually supplies config
  it('applies the configured primary color to the icon when steps exist', () => {
    const { container } = renderWithProviders(
      <IndoorInfo intermediateStepCount={2} toggleFunction={() => {}} />,
      { config: baseConfig },
    );
    expect(container.querySelector('.itinerary-search-icon')?.style.fill).toBe(
      baseConfig.colors.primary,
    );
  });

  it('calls toggleFunction when clicked and intermediate steps exist', () => {
    const toggleFunction = vi.fn();
    const { container } = renderWithProviders(
      <IndoorInfo intermediateStepCount={2} toggleFunction={toggleFunction} />,
      { config: baseConfig },
    );
    fireEvent.click(container.querySelector('.intermediate-steps-clickable'));
    expect(toggleFunction).toHaveBeenCalledTimes(1);
  });

  it('does not call toggleFunction when clicked with no intermediate steps', () => {
    const toggleFunction = vi.fn();
    const { container } = renderWithProviders(
      <IndoorInfo intermediateStepCount={0} toggleFunction={toggleFunction} />,
      { config: baseConfig },
    );
    fireEvent.click(container.querySelector('.intermediate-steps-clickable'));
    expect(toggleFunction).not.toHaveBeenCalled();
  });
});
