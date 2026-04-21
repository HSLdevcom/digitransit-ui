import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import * as ReactIntl from 'react-intl';
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
    sandbox.stub(ReactIntl, 'useIntl').returns(baseIntl);
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
      // description is a React Fragment wrapping [contentNode, optionalLink]
      const contentNode = description.props.children[0];
      expect(contentNode.type).to.equal('p');
    });

    it('wraps multiple content items in a <ul>', () => {
      const wrapper = render();
      const modalContent = wrapper.find('ModalContent');
      const description = modalContent.prop('description');
      // description is a React Fragment; first child is the content node
      const contentNode = description.props.children[0];
      expect(contentNode.type).to.equal('ul');
      expect(contentNode.props.children).to.have.lengthOf(2);
    });
  });

  describe('Link handling', () => {
    it('omits the link when no link is provided for the locale', () => {
      const notification = { ...baseNotification, link: undefined };
      const wrapper = render(notification);
      const description = wrapper.find('ModalContent').prop('description');
      // second child of the fragment is the conditional link anchor
      const linkChild = description.props.children[1];
      expect(linkChild).to.equal(null);
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
    it('closes the modal when onOpenChange is called with false', () => {
      const wrapper = render();
      // Open first
      wrapper.find('.route-notification-trigger').simulate('click');
      expect(wrapper.find('Modal').prop('open')).to.equal(true);
      // Close via the Modal's onOpenChange handler (wired to setOpen)
      wrapper.find('Modal').prop('onOpenChange')(false);
      expect(wrapper.find('Modal').prop('open')).to.equal(false);
    });
  });
});
