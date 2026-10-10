import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FavouriteModal from './src/index';

const place = { address: 'Mannerheimintie 1', lat: 60.2, lon: 24.9 };

function renderModal(props = {}) {
  const handlers = {
    handleClose: vi.fn(),
    saveFavourite: vi.fn(),
    cancelSelected: vi.fn(),
  };
  const view = render(
    <FavouriteModal
      isModalOpen
      lang="en"
      favourite={place}
      autosuggestComponent={<input aria-label="search" />}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, ...view };
}

const saveButton = () =>
  screen.getByRole('button', { name: /save a place|save place/i });

describe('Testing @digitransit-component/digitransit-component-favourite-modal module', () => {
  it('renders nothing when closed', () => {
    renderModal({ isModalOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows a "Save place" header and a disabled save button until an icon is chosen', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Save place' })).toBeTruthy();
    expect(screen.getByText('Save').closest('button').disabled).toBe(true);
  });

  it('marks the chosen icon as pressed and enables saving', () => {
    renderModal();
    const home = screen.getByLabelText('home');
    expect(home.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(home);
    expect(home.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Save').closest('button').disabled).toBe(false);
  });

  it('saves the favourite with the chosen icon and closes the dialog', () => {
    const { saveFavourite, handleClose } = renderModal({
      favourite: { ...place, defaultName: 'Mannerheimintie' },
    });
    fireEvent.click(screen.getByLabelText('home'));
    fireEvent.click(saveButton());

    expect(saveFavourite).toHaveBeenCalledTimes(1);
    const saved = saveFavourite.mock.calls[0][0];
    expect(saved).toMatchObject({
      ...place,
      name: 'Mannerheimintie',
      selectedIconId: 'icon-icon_home',
      type: 'place',
    });
    expect(saved).not.toHaveProperty('defaultName');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('prefers the typed name over the default name', () => {
    const { saveFavourite } = renderModal({
      favourite: { ...place, defaultName: 'Mannerheimintie' },
    });
    fireEvent.change(screen.getByPlaceholderText(/name a place/i), {
      target: { value: 'Home' },
    });
    fireEvent.click(screen.getByLabelText('home'));
    fireEvent.click(saveButton());
    expect(saveFavourite.mock.calls[0][0].name).toBe('Home');
  });

  it('cannot be saved without a location', () => {
    const { saveFavourite } = renderModal({ favourite: { address: 'x' } });
    fireEvent.click(screen.getByLabelText('home'));
    expect(screen.getByText('Save').closest('button').disabled).toBe(true);
    fireEvent.click(screen.getByText('Save'));
    expect(saveFavourite).not.toHaveBeenCalled();
  });

  it('keeps the typed name and icon when the location changes', () => {
    const { rerender, saveFavourite, ...handlers } = renderModal();
    fireEvent.change(screen.getByPlaceholderText(/name a place/i), {
      target: { value: 'Home' },
    });
    fireEvent.click(screen.getByLabelText('home'));
    rerender(
      <FavouriteModal
        isModalOpen
        lang="en"
        autosuggestComponent={<input aria-label="search" />}
        favourite={{ address: 'Other street 2', lat: 61, lon: 25 }}
        saveFavourite={saveFavourite}
        handleClose={handlers.handleClose}
      />,
    );
    fireEvent.click(saveButton());
    expect(saveFavourite.mock.calls[0][0]).toMatchObject({
      address: 'Other street 2',
      lat: 61,
      lon: 25,
      name: 'Home',
      selectedIconId: 'icon-icon_home',
    });
  });

  it('discards edits when the dialog is closed and reopened', () => {
    const { rerender, saveFavourite, handleClose } = renderModal();
    fireEvent.click(screen.getByLabelText('home'));
    const props = {
      lang: 'en',
      favourite: place,
      autosuggestComponent: <input aria-label="search" />,
      saveFavourite,
      handleClose,
    };
    rerender(<FavouriteModal isModalOpen={false} {...props} />);
    rerender(<FavouriteModal isModalOpen {...props} />);
    expect(screen.getByLabelText('home').getAttribute('aria-pressed')).toBe(
      'false',
    );
  });

  it('calls handleClose when the dialog close button is pressed', () => {
    const { handleClose } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('when editing an existing favourite', () => {
    const favourite = {
      ...place,
      favouriteId: 'fav1',
      name: 'Work',
      selectedIconId: 'icon-icon_work',
    };

    it('shows an "Edit place" header, the existing values and a cancel button', () => {
      renderModal({ favourite });
      expect(screen.getByRole('heading', { name: 'Edit place' })).toBeTruthy();
      expect(screen.getByDisplayValue('Work')).toBeTruthy();
      expect(screen.getByLabelText('work').getAttribute('aria-pressed')).toBe(
        'true',
      );
      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('calls cancelSelected when cancel is pressed', () => {
      const { cancelSelected, handleClose } = renderModal({ favourite });
      fireEvent.click(screen.getByText('Cancel'));
      expect(cancelSelected).toHaveBeenCalledTimes(1);
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls cancelSelected instead of handleClose after saving', () => {
      const { saveFavourite, cancelSelected, handleClose } = renderModal({
        favourite,
      });
      fireEvent.click(saveButton());
      expect(saveFavourite.mock.calls[0][0]).toMatchObject({
        favouriteId: 'fav1',
        name: 'Work',
        type: 'place',
      });
      expect(cancelSelected).toHaveBeenCalledTimes(1);
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  it('does not show a cancel button when adding a new favourite', () => {
    renderModal();
    expect(screen.queryByText('Cancel')).toBeNull();
  });
});
