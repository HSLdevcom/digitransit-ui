import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DialogModal from './src/index.js';

// test.js still doesn't use literal JSX (kept as a mechanical migration from
// Mocha, not a redesign) - use React.createElement directly instead.
const h = React.createElement;

// Under Mocha, @hsl-fi/dialog was ESM-only and couldn't be require()'d, so
// stub-esm-peer-deps.js replaced Modal/ConfirmationModalContent with a stub
// that always rendered null - these tests could only check "doesn't throw",
// not real dialog content or button behavior. Vitest loads the real,
// un-stubbed @hsl-fi/dialog (built on @radix-ui/react-dialog), so this now
// asserts on its actual rendered output.
describe('Testing @digitransit-component/digitransit-component-dialog-modal module', () => {
  it('renders the dialog with its header text when open', () => {
    render(
      h(DialogModal, {
        isModalOpen: true,
        headerText: 'Delete this place?',
        primaryButtonText: 'Delete',
        primaryButtonOnClick: () => {},
        lang: 'en',
      }),
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Delete this place?')).toBeTruthy();
  });

  it('renders nothing when closed', () => {
    render(
      h(DialogModal, {
        isModalOpen: false,
        headerText: 'Delete this place?',
        primaryButtonText: 'Delete',
        primaryButtonOnClick: () => {},
        lang: 'en',
      }),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('invokes primaryButtonOnClick when the confirm button is clicked', () => {
    const primaryButtonOnClick = vi.fn();
    render(
      h(DialogModal, {
        isModalOpen: true,
        headerText: 'Delete this place?',
        primaryButtonText: 'Delete',
        primaryButtonOnClick,
        lang: 'en',
      }),
    );
    // Both the row and column button layouts render simultaneously in
    // jsdom (their visibility is normally decided by a CSS media query,
    // which jsdom doesn't apply), so there are two "Delete" buttons.
    const [deleteButton] = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);
    expect(primaryButtonOnClick).toHaveBeenCalledTimes(1);
  });
});
