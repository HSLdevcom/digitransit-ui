/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FavouriteModalModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically.
const FavouriteModal = FavouriteModalModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
const h = React.createElement;

describe('Testing @digitransit-component/digitransit-component-favourite-modal module', () => {
  it('shows a "Save place" header and a disabled save button until an icon is chosen', () => {
    render(
      h(FavouriteModal, {
        isModalOpen: true,
        handleClose: () => {},
        saveFavourite: () => {},
        appElement: '#app',
        lang: 'en',
        favourite: { address: 'Mannerheimintie 1', lat: 60.2, lon: 24.9 },
        autosuggestComponent: h('input', { placeholder: 'search' }),
      }),
    );
    expect(screen.getByText('Save place')).to.exist;
    expect(screen.getByText('Save').getAttribute('aria-disabled')).to.equal(
      'true',
    );
  });

  it('enables saving once an icon is chosen, and reports the chosen favourite with its icon', () => {
    const saved = [];
    const closed = [];
    render(
      h(FavouriteModal, {
        isModalOpen: true,
        handleClose: () => closed.push(true),
        saveFavourite: favourite => saved.push(favourite),
        appElement: '#app',
        lang: 'en',
        favourite: { address: 'Mannerheimintie 1', lat: 60.2, lon: 24.9 },
        autosuggestComponent: h('input', { placeholder: 'search' }),
      }),
    );
    fireEvent.click(screen.getByLabelText('home'));
    const saveButton = screen.getByText('Save');
    expect(saveButton.getAttribute('aria-disabled')).to.equal('false');
    fireEvent.click(saveButton);
    expect(saved).to.have.lengthOf(1);
    expect(saved[0]).to.include({
      address: 'Mannerheimintie 1',
      lat: 60.2,
      lon: 24.9,
      selectedIconId: 'icon-icon_home',
      type: 'place',
    });
    expect(closed).to.deep.equal([true]);
  });

  it('shows an "Edit place" header when editing an existing favourite', () => {
    render(
      h(FavouriteModal, {
        isModalOpen: true,
        handleClose: () => {},
        saveFavourite: () => {},
        appElement: '#app',
        lang: 'en',
        favourite: {
          favouriteId: 'fav1',
          address: 'Mannerheimintie 1',
          lat: 60.2,
          lon: 24.9,
          selectedIconId: 'icon-icon_home',
        },
        autosuggestComponent: h('input', { placeholder: 'search' }),
      }),
    );
    expect(screen.getByText('Edit place')).to.exist;
  });
});
