import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import RouteNumberContainer from '../../../app/component/RouteNumberContainer';

describe('<RouteNumberContainer />', () => {
  it('falls back to the agency name when the route has no short name and agency display is enabled', () => {
    const config = createTestConfig({ agency: { show: true } });
    const { container } = renderWithProviders(
      <RouteNumberContainer
        route={{ mode: 'BUS', agency: { name: 'Test Agency' } }}
      />,
      { config },
    );
    expect(container.textContent).toContain('Test Agency');
  });
});
