import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import SelectStopRow from '../../../../../app/component/map/tile-layer/SelectStopRow';

const baseConfig = createTestConfig();

const baseProps = {
  gtfsId: 'HSL:1234',
  type: 'BUS',
  name: 'Stop A',
};

describe('<SelectStopRow />', () => {
  it('renders the stop name', () => {
    const { container } = renderWithProviders(
      <SelectStopRow {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('Stop A');
  });

  it('applies the configured color for the mode icon', () => {
    const { container } = renderWithProviders(
      <SelectStopRow {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.querySelector('svg')?.style.fill).toBe(
      baseConfig.colors.bus,
    );
  });
});
