import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import FavouriteEditingModal from './src/index';

const favourites = [
  {
    name: 'Home',
    address: 'Kotikatu 1, Helsinki',
    favouriteId: 'fav1',
    selectedIconId: 'icon-icon_home',
  },
  {
    name: 'Work',
    address: 'Toimistotie 2, Helsinki',
    favouriteId: 'fav2',
    selectedIconId: 'icon-icon_work',
  },
];

function renderModal(props = {}) {
  const handlers = {
    handleClose: vi.fn(),
    updateFavourites: vi.fn(),
    deleteFavourite: vi.fn(),
    onEditSelected: vi.fn(),
  };
  const view = render(
    <FavouriteEditingModal
      favourites={favourites}
      isModalOpen
      isLoading={false}
      lang="en"
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, ...view };
}

describe('Testing @digitransit-component/digitransit-component-favourite-editing-modal module', () => {
  it('renders nothing when closed', () => {
    renderModal({ isModalOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('lists every favourite with its name and address', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: 'Edit places' })).toBeTruthy();
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Kotikatu 1, Helsinki')).toBeTruthy();
    expect(screen.getByText('Work')).toBeTruthy();
    expect(screen.getByText('Toimistotie 2, Helsinki')).toBeTruthy();
  });

  it('calls onEditSelected with the chosen favourite when its edit control is clicked', () => {
    const { onEditSelected } = renderModal();
    fireEvent.click(screen.getByLabelText('Edit place: Home'));
    expect(onEditSelected).toHaveBeenCalledTimes(1);
    expect(onEditSelected.mock.calls[0][0]).toMatchObject({
      favouriteId: 'fav1',
      name: 'Home',
    });
  });

  it('reorders the list when the move-down control is used', () => {
    renderModal();
    const itemsBefore = screen.getAllByRole('listitem');
    expect(within(itemsBefore[0]).getByText('Home')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Move favourite down'));

    const itemsAfter = screen.getAllByRole('listitem');
    expect(within(itemsAfter[0]).getByText('Work')).toBeTruthy();
    expect(within(itemsAfter[1]).getByText('Home')).toBeTruthy();
  });

  it('saves the new order when the dialog is closed', () => {
    const { handleClose, updateFavourites } = renderModal();
    fireEvent.click(screen.getByLabelText('Move favourite down'));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(updateFavourites).toHaveBeenCalledTimes(1);
    expect(updateFavourites.mock.calls[0][0].map(f => f.favouriteId)).toEqual([
      'fav2',
      'fav1',
    ]);
  });

  it('does not save when the order is unchanged', () => {
    const { handleClose, updateFavourites } = renderModal();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(updateFavourites).not.toHaveBeenCalled();
  });

  it('asks for confirmation instead of the list when a delete control is clicked', () => {
    const { deleteFavourite } = renderModal();
    fireEvent.click(screen.getByLabelText('Delete place: Home'));

    expect(screen.queryByText('Edit places')).toBeNull();
    expect(screen.getByText('Do you want to delete the place?')).toBeTruthy();
    expect(deleteFavourite).not.toHaveBeenCalled();

    const [deleteButton] = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);
    expect(deleteFavourite).toHaveBeenCalledTimes(1);
    expect(deleteFavourite.mock.calls[0][0]).toMatchObject({
      favouriteId: 'fav1',
    });
  });

  it('returns to the list when deleting is cancelled', () => {
    const { deleteFavourite } = renderModal();
    fireEvent.click(screen.getByLabelText('Delete place: Home'));
    const [cancelButton] = screen.getAllByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(deleteFavourite).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Edit places' })).toBeTruthy();
  });
});
