import { fireEvent, screen } from '@testing-library/react';
import * as HslModalModule from '@hsl-fi/modal';
import { renderWithProviders } from '../../../../helpers/mock-providers';
import { createTestConfig } from '../../../../helpers/mock-context';
import NavigatorIntroModal from '../../../../../../app/component/itinerary/navigator/navigatorintro/NavigatorIntroModal';

// eslint-disable-next-line react/prop-types
const ModalStub = ({ isOpen, children }) => (isOpen ? children : null);

const baseConfig = createTestConfig();

describe('<NavigatorIntroModal />', () => {
  beforeEach(() => {
    vi.spyOn(HslModalModule, 'default', 'get').mockReturnValue(ModalStub);
  });

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
