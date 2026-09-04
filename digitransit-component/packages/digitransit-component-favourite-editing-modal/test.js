/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import FavouriteEditingModalModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically.
const FavouriteEditingModal = FavouriteEditingModalModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
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
    expect(screen.getByText('Edit places')).to.exist;
    expect(screen.getByText('Home')).to.exist;
    expect(screen.getByText('Kotikatu 1, Helsinki')).to.exist;
    expect(screen.getByText('Work')).to.exist;
    expect(screen.getByText('Toimistotie 2, Helsinki')).to.exist;
  });

  it('calls onEditSelected with the chosen favourite when its edit control is clicked', () => {
    const edited = [];
    renderModal({ onEditSelected: favourite => edited.push(favourite) });
    screen.getByLabelText('Edit place: Home').click();
    expect(edited).to.have.lengthOf(1);
    expect(edited[0]).to.include({ favouriteId: 'fav1', name: 'Home' });
  });

  it('reorders the list when the move-down/move-up controls are used', () => {
    renderModal();
    const itemsBefore = screen.getAllByRole('listitem');
    expect(within(itemsBefore[0]).getByText('Home')).to.exist;

    screen.getByLabelText('Move favourite down').click();

    const itemsAfter = screen.getAllByRole('listitem');
    expect(within(itemsAfter[0]).getByText('Work')).to.exist;
    expect(within(itemsAfter[1]).getByText('Home')).to.exist;
  });

  it('hides the list and shows the delete confirmation when a delete control is clicked', () => {
    renderModal();
    expect(screen.getByText('Edit places')).to.exist;
    screen.getByLabelText('Delete place: Home').click();
    expect(screen.queryByText('Edit places')).to.equal(null);
  });
});
