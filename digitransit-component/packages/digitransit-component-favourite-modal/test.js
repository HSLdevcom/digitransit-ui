import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FavouriteModal from './src/index.js';

describe('Testing @digitransit-component/digitransit-component-favourite-modal module', () => {
  it('shows a "Save place" header and a disabled save button until an icon is chosen', () => {
    render(
      <FavouriteModal
        isModalOpen
        handleClose={() => {}}
        saveFavourite={() => {}}
        appElement="#app"
        lang="en"
        favourite={{ address: 'Mannerheimintie 1', lat: 60.2, lon: 24.9 }}
        autosuggestComponent={<input placeholder="search" />}
      />,
    );
    expect(screen.getByText('Save place')).toBeTruthy();
    expect(screen.getByText('Save').getAttribute('aria-disabled')).toBe('true');
  });

  it('enables saving once an icon is chosen, and reports the chosen favourite with its icon', () => {
    const saved = [];
    const closed = [];
    render(
      <FavouriteModal
        isModalOpen
        handleClose={() => closed.push(true)}
        saveFavourite={favourite => saved.push(favourite)}
        appElement="#app"
        lang="en"
        favourite={{ address: 'Mannerheimintie 1', lat: 60.2, lon: 24.9 }}
        autosuggestComponent={<input placeholder="search" />}
      />,
    );
    fireEvent.click(screen.getByLabelText('home'));
    const saveButton = screen.getByText('Save');
    expect(saveButton.getAttribute('aria-disabled')).toBe('false');
    fireEvent.click(saveButton);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      address: 'Mannerheimintie 1',
      lat: 60.2,
      lon: 24.9,
      selectedIconId: 'icon-icon_home',
      type: 'place',
    });
    expect(closed).toEqual([true]);
  });

  it('shows an "Edit place" header when editing an existing favourite', () => {
    render(
      <FavouriteModal
        isModalOpen
        handleClose={() => {}}
        saveFavourite={() => {}}
        appElement="#app"
        lang="en"
        favourite={{
          favouriteId: 'fav1',
          address: 'Mannerheimintie 1',
          lat: 60.2,
          lon: 24.9,
          selectedIconId: 'icon-icon_home',
        }}
        autosuggestComponent={<input placeholder="search" />}
      />,
    );
    expect(screen.getByText('Edit place')).toBeTruthy();
  });
});
