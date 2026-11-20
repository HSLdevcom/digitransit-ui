import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import Favourite from '../../../app/component/Favourite';

const config = createTestConfig({ allowFavouritesFromLocalstorage: false, user: {} });

describe('<Favourite />', () => {
  it('returns focus to the star when the login prompt is closed', async () => {
    renderWithProviders(<Favourite addFavourite={() => {}} delFavourite={() => {}} />, { config });
    const star = screen.getByRole('button', { name: 'Add to your Favorites' });
    star.focus();
    fireEvent.click(star);

    fireEvent.keyDown(await screen.findByRole('dialog'), { key: 'Escape' });

    await waitFor(() => expect(document.activeElement).toBe(star));
  });
});
