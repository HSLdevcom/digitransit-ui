/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FavouriteBarModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically.
const FavouriteBar = FavouriteBarModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
const h = React.createElement;

const favourites = [
  { name: 'Home', address: 'Kotikatu 1, Helsinki', favouriteId: 'fav1' },
  { name: 'Work', address: 'Toimistotie 2, Helsinki', favouriteId: 'fav2' },
  {
    name: 'Gym',
    address: 'Liikuntakuja 3, Helsinki',
    favouriteId: 'fav3',
  },
];

describe('Testing @digitransit-component/digitransit-component-favourite-bar module', () => {
  it('shows the first two favourites directly, with the rest in the expandable list', () => {
    render(h(FavouriteBar, { favourites, lang: 'en' }));
    expect(screen.getByText('Home')).to.exist;
    expect(screen.getByText('Work')).to.exist;
    expect(screen.queryByText('Gym')).to.equal(null);
  });

  it('reveals the remaining favourites when the expand button is clicked', () => {
    render(h(FavouriteBar, { favourites, lang: 'en' }));
    fireEvent.click(screen.getByLabelText('Open favourites'));
    expect(screen.getByText('Gym')).to.exist;
  });

  it('calls onClickFavourite with the selected favourite from the expanded list', () => {
    const clicked = [];
    render(
      h(FavouriteBar, {
        favourites,
        lang: 'en',
        onClickFavourite: favourite => clicked.push(favourite.favouriteId),
      }),
    );
    fireEvent.click(screen.getByLabelText('Open favourites'));
    fireEvent.click(screen.getByText('Gym'));
    expect(clicked).to.deep.equal(['fav3']);
  });

  it('calls onClickFavourite when clicking the first favourite slot directly', () => {
    const clicked = [];
    render(
      h(FavouriteBar, {
        favourites,
        lang: 'en',
        onClickFavourite: favourite => clicked.push(favourite.favouriteId),
      }),
    );
    fireEvent.click(screen.getByText('Home'));
    expect(clicked).to.deep.equal(['fav1']);
  });

  it('calls onAddHome when there is no first favourite yet', () => {
    let addHomeCalled = false;
    render(
      h(FavouriteBar, {
        favourites: [],
        lang: 'en',
        onAddHome: () => {
          addHomeCalled = true;
        },
      }),
    );
    fireEvent.click(screen.getByLabelText('Add home'));
    expect(addHomeCalled).to.equal(true);
  });
});
