import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FavouriteBar from './src/index.js';

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
    render(<FavouriteBar favourites={favourites} lang="en" />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Work')).toBeTruthy();
    expect(screen.queryByText('Gym')).toBeNull();
  });

  it('reveals the remaining favourites when the expand button is clicked', () => {
    render(<FavouriteBar favourites={favourites} lang="en" />);
    fireEvent.click(screen.getByLabelText('Open favourites'));
    expect(screen.getByText('Gym')).toBeTruthy();
  });

  it('calls onClickFavourite with the selected favourite from the expanded list', () => {
    const clicked = [];
    render(
      <FavouriteBar
        favourites={favourites}
        lang="en"
        onClickFavourite={favourite => clicked.push(favourite.favouriteId)}
      />,
    );
    fireEvent.click(screen.getByLabelText('Open favourites'));
    fireEvent.click(screen.getByText('Gym'));
    expect(clicked).toEqual(['fav3']);
  });

  it('calls onClickFavourite when clicking the first favourite slot directly', () => {
    const clicked = [];
    render(
      <FavouriteBar
        favourites={favourites}
        lang="en"
        onClickFavourite={favourite => clicked.push(favourite.favouriteId)}
      />,
    );
    fireEvent.click(screen.getByText('Home'));
    expect(clicked).toEqual(['fav1']);
  });

  it('calls onAddHome when there is no first favourite yet', () => {
    let addHomeCalled = false;
    render(
      <FavouriteBar
        favourites={[]}
        lang="en"
        onAddHome={() => {
          addHomeCalled = true;
        }}
      />,
    );
    fireEvent.click(screen.getByLabelText('Add home'));
    expect(addHomeCalled).toBe(true);
  });
});
