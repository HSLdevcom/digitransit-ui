import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import MobileTicketPurchaseInformation from '../../../../app/component/itinerary/MobileTicketPurchaseInformation';

const baseConfig = createTestConfig({
  showTicketPrice: true,
  useTicketIcons: false,
  analyticsClass: 'ticket-link',
  ticketPurchaseLink: () => 'https://example.com',
  ticketButtonTextId: 'open-app',
  availableTickets: {},
});

const baseProps = {
  fares: [{ ticketName: 'AB', price: 3.1, isUnknown: false }],
};

describe('<MobileTicketPurchaseInformation />', () => {
  it('shows the required ticket name and price', () => {
    const { container } = renderWithProviders(
      <MobileTicketPurchaseInformation {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('AB');
    expect(container.textContent).toContain('3,10');
  });

  it('hides the price when config.showTicketPrice is false', () => {
    const { container } = renderWithProviders(
      <MobileTicketPurchaseInformation {...baseProps} />,
      { config: createTestConfig({ ...baseConfig, showTicketPrice: false }) },
    );
    expect(container.textContent).not.toContain('3,10');
  });

  it('links to the configured ticket purchase URL', () => {
    const { container } = renderWithProviders(
      <MobileTicketPurchaseInformation {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.querySelector('a.ticket-link')?.href).toBe(
      'https://example.com/',
    );
  });
});
