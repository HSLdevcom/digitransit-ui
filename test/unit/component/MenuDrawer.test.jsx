import { fireEvent, screen } from '@testing-library/react';
import Modal from 'react-modal';

import { renderWithProviders } from '../helpers/mock-providers';
import MenuDrawer from '../../../app/component/MenuDrawer';

describe('<MenuDrawer />', () => {
  beforeAll(() => Modal.setAppElement(document.createElement('div')));

  it('should request closing from the close button', () => {
    const onRequestChange = vi.fn();
    renderWithProviders(
      <MenuDrawer open onRequestChange={onRequestChange} breakpoint="large">
        <div>content</div>
      </MenuDrawer>,
      { config: { CONFIG: 'default', language: 'en' } },
    );

    expect(screen.getByText('content')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onRequestChange).toHaveBeenCalledTimes(1);
  });

  it('should use a custom close label', () => {
    renderWithProviders(
      <MenuDrawer
        open
        onRequestChange={() => {}}
        breakpoint="large"
        closeLabel="Close the main menu"
      >
        <div>content</div>
      </MenuDrawer>,
      { config: { CONFIG: 'default', language: 'en' } },
    );

    expect(
      screen.getByRole('button', { name: 'Close the main menu' }),
    ).toBeTruthy();
  });
});
