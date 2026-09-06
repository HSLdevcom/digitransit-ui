import React from 'react';
import ReactModal from 'react-modal';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from './helpers/mock-providers';
import AppBar from '../../app/component/AppBar';
import { mockContext } from './helpers/mock-context';

describe('<AppBar />', () => {
  beforeAll(() => {
    ReactModal.setAppElement(document.body);
    global.requestAnimationFrame = cb => setTimeout(cb, 0);
    global.cancelAnimationFrame = id => clearTimeout(id);
  });

  it('should show logo', () => {
    const { container } = renderWithProviders(
      <AppBar titleClicked={() => {}} logo="/" homeUrl="/" showLogo />,
    );
    expect(container.querySelector('.logo')).not.toBe(null);
  });

  it('should show text logo when textLogo is true', () => {
    const { container } = renderWithProviders(
      <AppBar titleClicked={() => {}} homeUrl="/" />,
      {
        config: {
          ...mockContext.config,
          textLogo: true,
          mainMenu: { show: true },
        },
      },
    );
    expect(container.querySelector('section.title.title')).not.toBe(null);
  });

  it('should open the menu modal on button click', () => {
    const { container } = renderWithProviders(
      <AppBar titleClicked={() => {}} logo="/" homeUrl="/" />,
    );
    expect(document.body.querySelector('.main-menu')).toBe(null);
    fireEvent.click(container.querySelector('#openMenuButton'));
    expect(document.body.querySelector('.main-menu')).not.toBe(null);
  });
});
