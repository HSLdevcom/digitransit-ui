import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import ReactModal from 'react-modal';
// Import from the "pure" entry point instead of the package root: the root
// entry auto-registers an `afterEach(cleanup)` that unmounts with real
// timers, racing @hsl-fi/modal's react-modal, which schedules its portal
// removal via `setTimeout(removePortal, closeTimeoutMS)` on unmount (see
// react-modal's Modal.js componentWillUnmount) instead of removing it
// synchronously. That timer can still be pending when this test file's
// jsdom environment is torn down, so it later fires against a
// `document` that no longer exists, surfacing as an unhandled
// "ReferenceError: document is not defined" - flaky since it depends on
// how quickly the environment teardown happens relative to the timeout.
// Cleaning up manually with fake timers (below) flushes that timeout
// synchronously while the environment is still alive.
import { render, screen, within, cleanup } from '@testing-library/react/pure';
import FavouriteEditingModal from './src/index.js';

afterEach(() => {
  vi.useFakeTimers();
  cleanup();
  vi.runAllTimers();
  vi.useRealTimers();
});

// @hsl-fi/modal's own useEffect calls Modal.setAppElement(appElement) on
// mount, but only after react-modal's own componentDidMount already ran
// (child effects fire before the parent's) - so on the very first render
// with isModalOpen already true, react-modal warns before that effect has
// had a chance to run. Set it upfront, same as the real app does once in
// app/component/trafficnow/TrafficNow.js.
ReactModal.setAppElement(document.querySelector('#app'));

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
    <FavouriteEditingModal
      handleClose={() => {}}
      updateFavourites={() => {}}
      deleteFavourite={() => {}}
      onEditSelected={() => {}}
      favourites={favourites}
      appElement="#app"
      isModalOpen
      isLoading={false}
      lang="en"
      {...props}
    />,
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
