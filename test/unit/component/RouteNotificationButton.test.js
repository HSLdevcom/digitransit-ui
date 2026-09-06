import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import RouteNotificationButton from '../../../app/component/routepage/RouteNotificationButton';

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
  const renderNotification = (notification = baseNotification) =>
    renderWithProviders(
      <RouteNotificationButton notification={notification} />,
    );

  it('renders the trigger button with the close button label', () => {
    const { container } = renderNotification();
    expect(
      container.querySelectorAll('.route-notification-trigger'),
    ).toHaveLength(1);
    expect(
      container.querySelector('.route-notification-trigger span').textContent,
    ).toBe('Close info');
  });

  it('renders nothing when closeButtonLabel is missing for the locale', () => {
    const notification = {
      ...baseNotification,
      closeButtonLabel: { fi: 'Sulje' },
    };
    const { container } = renderNotification(notification);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when closeButtonLabel is undefined', () => {
    const notification = { ...baseNotification, closeButtonLabel: undefined };
    const { container } = renderNotification(notification);
    expect(container.innerHTML).toBe('');
  });

  it('wraps multiple content items in a list when the modal opens', () => {
    const { container } = renderNotification();
    fireEvent.click(container.querySelector('.route-notification-trigger'));
    expect(document.body.querySelectorAll('ul')).toHaveLength(1);
    expect(document.body.querySelectorAll('ul li')).toHaveLength(2);
  });

  it('omits the link when no link is provided for the locale', () => {
    const notification = { ...baseNotification, link: undefined };
    const { container } = renderNotification(notification);
    fireEvent.click(container.querySelector('.route-notification-trigger'));
    expect(document.body.querySelector('a')).toBe(null);
  });

  it('opens the modal on click', () => {
    const { container } = renderNotification();
    fireEvent.click(container.querySelector('.route-notification-trigger'));
    expect(document.body.querySelector('[role="dialog"]')).not.toBe(null);
  });

  it('closes the modal when Escape is pressed', () => {
    const { container } = renderNotification();
    fireEvent.click(container.querySelector('.route-notification-trigger'));
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).not.toBe(null);
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(document.body.querySelector('[role="dialog"]')).toBe(null);
  });
});
