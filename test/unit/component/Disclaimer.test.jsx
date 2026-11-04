import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import Disclaimer from '../../../app/component/Disclaimer';

describe('<Disclaimer />', () => {
  it('renders header, text and an external link', () => {
    renderWithProviders(
      <Disclaimer
        header="Header"
        text="Some text"
        href="https://example.com"
        linkLabel="Read more"
      />,
    );
    expect(screen.getByText('Header')).toBeTruthy();
    expect(screen.getByText('Some text')).toBeTruthy();
    const link = screen.getByText('Read more').closest('a');
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('renders translated texts with node values, as in the scooter settings', () => {
    renderWithProviders(
      <Disclaimer
        headerId="settings-e-scooter-routes"
        textId="settings-e-scooter"
        values={{ paymentInfo: <b>payment info</b> }}
        href="https://example.com"
        linkLabelId="read-more"
      />,
    );
    expect(
      screen.getByText('Make electric scooters part of your routes!'),
    ).toBeTruthy();
    expect(screen.getByText('payment info')).toBeTruthy();
    expect(screen.getByText('Read more').closest('a')).toBeTruthy();
  });

  it('does not render a close button unless closable', () => {
    renderWithProviders(<Disclaimer text="Some text" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('calls onClose after the close animation ends', () => {
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <Disclaimer text="Some text" closable onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.animationEnd(container.firstChild.firstChild);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Some text')).toBeNull();
  });
});
