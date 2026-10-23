import React from 'react';
import { fireEvent } from '@testing-library/react';
import Snackbar from '../../../app/component/Snackbar';
import { BreakpointContext } from '../../../utils/client/BreakpointContext';
import { renderWithProviders } from '../helpers/mock-providers';

describe('<Snackbar />', () => {
  it('updates its layout from context while preserving notifications and close behavior', () => {
    const onClose = vi.fn();
    const view = breakpoint => (
      <BreakpointContext.Provider value={breakpoint}>
        <Snackbar
          show
          messageId="close"
          liveRegionMessage="Settings saved"
          onClose={onClose}
          breakpoint="large"
        />
      </BreakpointContext.Provider>
    );
    const { container, getByRole, rerender } = renderWithProviders(
      view('small'),
    );
    const snackbar = document.body.querySelector('.snackbar');

    expect(container.childElementCount).toBe(0);
    expect(snackbar.classList.contains('mobile-snackbar')).toBe(true);
    expect(snackbar.classList.contains('desktop-snackbar')).toBe(false);
    expect(getByRole('status').textContent).toBe('Settings saved');

    rerender(view('medium'));
    expect(snackbar.classList.contains('mobile-snackbar')).toBe(true);

    rerender(view('large'));
    expect(snackbar.classList.contains('desktop-snackbar')).toBe(true);
    expect(snackbar.classList.contains('mobile-snackbar')).toBe(false);
    expect(getByRole('status').textContent).toBe('Settings saved');

    fireEvent.click(snackbar.querySelector('.close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
