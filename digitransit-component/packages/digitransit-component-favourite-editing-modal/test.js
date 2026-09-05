import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import FavouriteEditingModal from './src/index.js';

// test.js still doesn't use literal JSX (kept as a mechanical migration from
// Mocha, not a redesign) - use React.createElement directly instead.
const h = React.createElement;

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

function renderModal(props) {
  return render(
    h(FavouriteEditingModal, {
      handleClose: () => {},
      updateFavourites: () => {},
      deleteFavourite: () => {},
      onEditSelected: () => {},
      favourites,
      appElement: '#app',
      isModalOpen: true,
      isLoading: false,
      lang: 'en',
      ...props,
    }),
  );
}

describe('Testing @digitransit-component/digitransit-component-favourite-editing-modal module', () => {
  it('lists every favourite with its name and address', () => {
    renderModal();
    expect(screen.getByText('Edit places')).toBeTruthy();
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Kotikatu 1, Helsinki')).toBeTruthy();
    expect(screen.getByText('Work')).toBeTruthy();
    expect(screen.getByText('Toimistotie 2, Helsinki')).toBeTruthy();
  });

  it('calls onEditSelected with the chosen favourite when its edit control is clicked', () => {
    const edited = [];
    renderModal({ onEditSelected: favourite => edited.push(favourite) });
    screen.getByLabelText('Edit place: Home').click();
    expect(edited).toHaveLength(1);
    expect(edited[0]).toMatchObject({ favouriteId: 'fav1', name: 'Home' });
  });

  it('reorders the list when the move-down/move-up controls are used', () => {
    renderModal();
    const itemsBefore = screen.getAllByRole('listitem');
    expect(within(itemsBefore[0]).getByText('Home')).toBeTruthy();

    screen.getByLabelText('Move favourite down').click();

    const itemsAfter = screen.getAllByRole('listitem');
    expect(within(itemsAfter[0]).getByText('Work')).toBeTruthy();
    expect(within(itemsAfter[1]).getByText('Home')).toBeTruthy();
  });

  it('hides the list and shows the delete confirmation when a delete control is clicked', () => {
    renderModal();
    expect(screen.getByText('Edit places')).toBeTruthy();
    screen.getByLabelText('Delete place: Home').click();
    expect(screen.queryByText('Edit places')).toBeNull();
  });
});
