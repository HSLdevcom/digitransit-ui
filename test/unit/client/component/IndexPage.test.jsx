import { screen } from '@testing-library/react';
import { ItineraryLocationProvider } from '../../../../src/client/hooks/ItineraryLocationContext';
import { FavouriteProvider } from '../../../../src/client/hooks/FavouriteContext';
import { MessageProvider } from '../../../../src/client/hooks/MessageContext';
import IndexPage from '../../../../src/client/component/IndexPage';
import { createTestConfig } from '../../helpers/mock-context';
import { mockMatch } from '../../helpers/mock-router';
import { renderWithProviders } from '../../helpers/mock-providers';

const config = createTestConfig({ language: 'en' });

const renderIndexPage = breakpoint =>
  renderWithProviders(
    <MessageProvider>
      <FavouriteProvider>
        <ItineraryLocationProvider>
          <IndexPage />
        </ItineraryLocationProvider>
      </FavouriteProvider>
    </MessageProvider>,
    { config, match: mockMatch, breakpoint },
  );

describe('<IndexPage />', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it.each(['large', 'small'])(
    'has no accessibility violations on a %s screen',
    async breakpoint => {
      renderIndexPage(breakpoint);
      expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
      await expect(document.body).toHaveNoA11yViolations();
    },
  );
});
