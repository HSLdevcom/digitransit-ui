import { useState } from 'react';
import PropTypes from 'prop-types';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import Favourite from '../../../../src/app/component/Favourite';

const localConfig = createTestConfig({ allowFavouritesFromLocalstorage: true, user: {} });
const loginConfig = createTestConfig({ allowFavouritesFromLocalstorage: false, user: {} });

// Updates favourite synchronously, like local storage favourites, and never reports fetching
function SynchronousFavourite({ add, del }) {
  const [favourite, setFavourite] = useState(false);
  return (
    <Favourite
      favourite={favourite}
      addFavourite={() => {
        add();
        setFavourite(true);
      }}
      delFavourite={() => {
        del();
        setFavourite(false);
      }}
    />
  );
}

SynchronousFavourite.propTypes = { add: PropTypes.func.isRequired, del: PropTypes.func.isRequired };

describe('<Favourite />', () => {
  it('can be toggled on and off when the update does not report fetching', () => {
    const add = vi.fn();
    const del = vi.fn();
    renderWithProviders(<SynchronousFavourite add={add} del={del} />, { config: localConfig });

    fireEvent.click(screen.getByRole('button', { name: 'Add to your Favorites' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove from favorites' }));

    expect(add).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledTimes(1);
  });

  it('returns focus to the star when the login prompt is closed', async () => {
    renderWithProviders(<Favourite addFavourite={() => {}} delFavourite={() => {}} />, {
      config: loginConfig,
    });
    const star = screen.getByRole('button', { name: 'Add to your Favorites' });
    star.focus();
    fireEvent.click(star);

    fireEvent.keyDown(await screen.findByRole('dialog'), { key: 'Escape' });

    await waitFor(() => expect(document.activeElement).toBe(star));
  });
});
