import React from 'react';
import { fireEvent } from '@testing-library/react';
import CookieSettingsButton from '../../app/component/CookieSettingsButton';
import { renderWithProviders } from './helpers/mock-providers';

describe('CookieSettingsButton', () => {
  afterEach(() => {
    global.window.CookieConsent.renew = undefined;
  });

  it('renders the button with correct text', () => {
    global.window.CookieConsent = { renew: vi.fn() };
    const { container } = renderWithProviders(<CookieSettingsButton />);
    const btn = container.querySelector('button');
    expect(btn.classList.contains('cookie-settings-button')).toBe(true);
  });

  it('renders the button with mobile class when isMobile is true', () => {
    global.window.CookieConsent = { renew: undefined };
    const { container } = renderWithProviders(
      <CookieSettingsButton isMobile />,
    );
    const btn = container.querySelector('button');
    expect(btn.classList.contains('cookie-settings-button-mobile')).toBe(true);
  });

  it('calls window.CookieConsent.renew when clicked', () => {
    global.window.CookieConsent = { renew: vi.fn() };
    const { container } = renderWithProviders(<CookieSettingsButton />);
    fireEvent.click(container.querySelector('button'));
    expect(window.CookieConsent.renew).toHaveBeenCalledOnce();
  });

  it('does not throw if window.CookieConsent.renew is undefined', () => {
    window.CookieConsent = { renew: undefined };
    const { container } = renderWithProviders(<CookieSettingsButton />);
    expect(() => {
      fireEvent.click(container.querySelector('button'));
    }).not.toThrow();
  });
});
