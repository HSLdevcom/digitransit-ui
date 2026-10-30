import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../helpers/mock-providers';
import { createTestConfig } from '../../../../helpers/mock-context';
import NavigatorIntroModal from '../../../../../../app/component/itinerary/navigator/navigatorintro/NavigatorIntroModal';

vi.mock('@hsl-fi/modal', () => ({
  // eslint-disable-next-line react/prop-types
  default: ({ isOpen, children }) => (isOpen ? children : null),
}));

const baseConfig = createTestConfig();

describe('<NavigatorIntroModal />', () => {
  it('renders the navigator intro content', () => {
    renderWithProviders(
      <NavigatorIntroModal
        onClose={() => {}}
        onOpenGeolocationInfo={() => {}}
      />,
      { config: baseConfig },
    );
    expect(screen.getByText(/You'll get assistance/)).toBeTruthy();
  });

  it('calls onOpenGeolocationInfo when "Read more" is clicked', () => {
    const onOpenGeolocationInfo = vi.fn();
    renderWithProviders(
      <NavigatorIntroModal
        onClose={() => {}}
        onOpenGeolocationInfo={onOpenGeolocationInfo}
      />,
      { config: baseConfig },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Read more' }));
    expect(onOpenGeolocationInfo).toHaveBeenCalledTimes(1);
  });
});
