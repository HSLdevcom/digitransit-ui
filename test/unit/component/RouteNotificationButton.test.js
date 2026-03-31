import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import * as useTranslationsContextModule from '../../../app/util/useTranslationsContext';
import RouteNotificationButton from '../../../app/component/routepage/RouteNotificationButton';

const baseIntl = {
  formatMessage: ({ id }) => id,
  locale: 'en',
};

const baseNotification = {
  closeButtonLabel: { en: 'Close info', fi: 'Sulje', sv: 'Stäng' },
  content: {
    en: ['First item', 'Second item'],
    fi: ['Ensimmäinen', 'Toinen'],
    sv: ['Första', 'Andra'],
  },
  link: { en: 'example.com', fi: 'example.fi', sv: 'example.se' },
};

describe('<RouteNotificationButton />', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox
      .stub(useTranslationsContextModule, 'useTranslationsContext')
      .returns(baseIntl);
  });

  afterEach(() => {
    sandbox.restore();
  });

  const render = (notification = baseNotification) =>
    shallow(<RouteNotificationButton notification={notification} />);

  describe('Rendering', () => {
    it('renders the trigger button with the close button label', () => {
      const wrapper = render();
      expect(wrapper.find('.route-notification-trigger')).to.have.lengthOf(1);
      expect(
        wrapper.find('.route-notification-trigger').find('span').text(),
      ).to.equal('Close info');
    });

    it('renders nothing when closeButtonLabel is missing for the locale', () => {
      const notification = {
        ...baseNotification,
        closeButtonLabel: { fi: 'Sulje' }, // no 'en' key
      };
      const wrapper = render(notification);
      expect(wrapper.type()).to.equal(null);
    });

    it('renders nothing when closeButtonLabel is undefined', () => {
      const notification = { ...baseNotification, closeButtonLabel: undefined };
      const wrapper = render(notification);
      expect(wrapper.type()).to.equal(null);
    });
  });

  describe('Content list', () => {
    it('wraps a single content item in a <p> tag', () => {
      const notification = {
        ...baseNotification,
        content: { en: ['Only item'] },
      };
      const wrapper = render(notification);
      // The Modal receives a description prop containing the content node.
      // With shallow rendering we inspect the ModalContent description prop.
      const modalContent = wrapper.find('ModalContent');
      expect(modalContent).to.have.lengthOf(1);
      const description = modalContent.prop('description');
      expect(description.type).to.equal('p');
    });

    it('wraps multiple content items in a <ul>', () => {
      const wrapper = render();
      const modalContent = wrapper.find('ModalContent');
      const description = modalContent.prop('description');
      expect(description.type).to.equal('ul');
      expect(description.props.children).to.have.lengthOf(2);
    });
  });

  describe('Link handling', () => {
    it('omits the link button when no link is provided for the locale', () => {
      const notification = { ...baseNotification, link: undefined };
      const wrapper = render(notification);
      const buttons = wrapper.find('ModalContent').prop('buttons');
      expect(buttons.every(b => !b.href)).to.equal(true);
    });
  });

  describe('Trigger button', () => {
    it('has aria-haspopup="dialog"', () => {
      const wrapper = render();
      expect(
        wrapper.find('.route-notification-trigger').prop('aria-haspopup'),
      ).to.equal('dialog');
    });

    it('opens the modal on click', () => {
      const wrapper = render();
      wrapper.find('.route-notification-trigger').simulate('click');
      expect(wrapper.find('Modal').prop('open')).to.equal(true);
    });
  });

  describe('Close button', () => {
    it('closes the modal when the close button is clicked', () => {
      const wrapper = render();
      // Open first
      wrapper.find('.route-notification-trigger').simulate('click');
      expect(wrapper.find('Modal').prop('open')).to.equal(true);
      // Click close via buttons prop
      const closeButton = wrapper
        .find('ModalContent')
        .prop('buttons')
        .find(b => b.variant === 'secondary');
      closeButton.onClick();
      expect(wrapper.find('Modal').prop('open')).to.equal(false);
    });
  });
});
