import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import CookieSettingsButton from '../../app/component/CookieSettingsButton';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';

describe('CookieSettingsButton', () => {
  function renderWithIntl(ui) {
    return shallowWithIntl(ui, {
      context: {
        match: {
          location: {
            pathname: '/',
          },
        },
        config: {
          allowLogin: false,
          useCookiesPrompt: true,
          URL: {
            ROOTLINK: 'http://www.foo.com',
          },
        },
      },
    });
  }

  afterEach(() => {
    global.window.CookieConsent.renew = undefined;
  });

  it('renders the button with correct text', () => {
    global.window.CookieConsent = { renew: sinon.spy() };

    const wrapper = renderWithIntl(<CookieSettingsButton />);
    const btn = wrapper.find('button');
    expect(btn.hasClass('cookie-settings-button'));
  });

  it('renders the button with mobile class when isMobile is true', () => {
    const wrapper = renderWithIntl(<CookieSettingsButton isMobile />);
    const btn = wrapper.find('button');
    expect(btn.hasClass('cookie-settings-button-mobile')).to.equal(true);
  });

  it('calls window.CookieConsent.renew when clicked', () => {
    global.window.CookieConsent = { renew: sinon.spy() };
    const wrapper = renderWithIntl(<CookieSettingsButton />);
    wrapper.find('button').simulate('click');
    sinon.assert.calledOnce(window.CookieConsent.renew);
  });

  it('does not throw if window.CookieConsent.renew is undefined', () => {
    window.CookieConsent = { renew: undefined };
    const wrapper = renderWithIntl(<CookieSettingsButton />);

    expect(() => {
      wrapper.find('button').simulate('click');
    }).to.not.throw();
  });
});
