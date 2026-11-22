import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import DisruptionCardShell from '../../../../../src/client/component/trafficnow/DisruptionCardShell';
import { clearOpenedCard } from '../../../../../src/client/component/trafficnow/cardFocus';

const renderShell = (props = {}) =>
  renderWithProviders(
    <DisruptionCardShell
      cardKey="card-1"
      headerLeft="Header"
      ariaLabel="Open details"
      onOpen={() => {}}
      {...props}
    >
      Content
    </DisruptionCardShell>,
  );

describe('<DisruptionCardShell />', () => {
  afterEach(clearOpenedCard);

  it('takes focus when it is remounted after being opened', async () => {
    const { unmount } = renderShell();
    fireEvent.click(screen.getByText('Content'));
    unmount();

    renderShell();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open details' })),
    );
  });

  it('does not take focus when another card was opened', async () => {
    const { unmount } = renderShell({ cardKey: 'card-2' });
    fireEvent.click(screen.getByText('Content'));
    unmount();

    renderShell();
    await new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
    expect(document.activeElement).toBe(document.body);
  });
});
