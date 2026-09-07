import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { fireEvent } from '@testing-library/react';
import CookieSettingsButton from '../../app/component/CookieSettingsButton';
import { renderWithProviders } from './helpers/mock-providers';

describe('CookieSettingsButton', () => {
  afterEach(() => {
    global.window.CookieConsent.renew = undefined;
  });

  it('renders the button with correct text', () => {
    global.window.CookieConsent = { renew: sinon.spy() };
    const { container } = renderWithProviders(<CookieSettingsButton />);
    const btn = container.querySelector('button');
    expect(btn.classList.contains('cookie-settings-button')).to.equal(true);
  });

  it('renders the button with mobile class when isMobile is true', () => {
    global.window.CookieConsent = { renew: undefined };
    const { container } = renderWithProviders(
      <CookieSettingsButton isMobile />,
    );
    const btn = container.querySelector('button');
    expect(btn.classList.contains('cookie-settings-button-mobile')).to.equal(
      true,
    );
  });

  it('calls window.CookieConsent.renew when clicked', () => {
    global.window.CookieConsent = { renew: sinon.spy() };
    const { container } = renderWithProviders(<CookieSettingsButton />);
    fireEvent.click(container.querySelector('button'));
    sinon.assert.calledOnce(window.CookieConsent.renew);
  });

  it('does not throw if window.CookieConsent.renew is undefined', () => {
    window.CookieConsent = { renew: undefined };
    const { container } = renderWithProviders(<CookieSettingsButton />);
    expect(() => {
      fireEvent.click(container.querySelector('button'));
    }).to.not.throw();
  });
});
