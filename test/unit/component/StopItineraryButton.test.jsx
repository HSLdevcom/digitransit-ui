import { fireEvent, screen, within } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import { mockRouter, mockMatch } from '../helpers/mock-router';
import StopItineraryButton from '../../../app/component/map/StopItineraryButton';

const stop = { name: 'Test stop', lat: 60.1, lon: 24.9, gtfsId: 'HSL:1' };

function renderButton(config = createTestConfig()) {
  const router = { ...mockRouter, push: vi.fn() };
  renderWithProviders(<StopItineraryButton stop={stop} />, {
    config,
    router,
    match: { ...mockMatch, router },
  });
  return router;
}

describe('<StopItineraryButton />', () => {
  it('opens a dialog and routes from the stop when origin is selected', () => {
    const router = renderButton(createTestConfig({ viaPointsEnabled: false }));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button'));
    const dialog = screen.getByRole('dialog');
    // origin, destination and the close button
    expect(within(dialog).getAllByRole('button').length).toBe(3);

    fireEvent.click(screen.getByText(/origin/i));
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push.mock.calls[0][0].pathname).toContain('Test%20stop');
  });

  it('offers the via point option only when enabled', () => {
    renderButton(createTestConfig({ viaPointsEnabled: true }));
    fireEvent.click(screen.getByRole('button'));
    const buttons = within(screen.getByRole('dialog')).getAllByRole('button');
    // origin, via point, destination and the close button
    expect(buttons.length).toBe(4);
  });
});
