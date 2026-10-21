import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import AlertBanner from '../../../app/component/AlertBanner';
import { AlertSeverityLevelType } from '../../../utils/shared/constants';

// jsdom has no layout, so truncation would cut the text; the global Link mock drops the anchor
vi.mock('react-truncate-markup', () => ({
  default: ({ children }) => children,
}));
vi.mock('found', async importOriginal => ({
  ...(await importOriginal()),
  // eslint-disable-next-line react/prop-types
  Link: ({ to, className, children }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const config = {
  CONFIG: 'default',
  URL: {},
  language: 'fi',
  colors: { primary: '#007ac9', caution: '#dc0451' },
};

const render = props =>
  renderWithProviders(<AlertBanner linkAddress="/pysakit/HSL:1" {...props} />, {
    config,
  });

describe('<AlertBanner />', () => {
  it('should render nothing if the alert has no header or description', () => {
    const { container } = render({
      alerts: [{ alertSeverityLevel: AlertSeverityLevelType.Info }],
    });
    expect(container.querySelector('.alert-banner-link')).toBeNull();
  });

  it('should link to the given address', () => {
    const { container } = render({
      alerts: [
        {
          alertHeaderText: 'mock-header',
          alertSeverityLevel: AlertSeverityLevelType.Info,
        },
      ],
    });
    const link = container.querySelector('.alert-banner-link');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/pysakit/HSL:1');
  });

  it('should show the header of the most severe alert', () => {
    const { container } = render({
      alerts: [
        {
          alertHeaderText: 'info-header',
          alertSeverityLevel: AlertSeverityLevelType.Info,
        },
        {
          alertHeaderText: 'severe-header',
          alertSeverityLevel: AlertSeverityLevelType.Severe,
        },
      ],
    });
    const link = container.querySelector('.alert-banner-link');
    expect(link.classList.contains('severe')).toBe(true);
    expect(link.textContent).toContain('severe-header');
    expect(link.textContent).not.toContain('info-header');
  });

  it('should fall back to the description if there is no header', () => {
    const { container } = render({
      alerts: [
        {
          alertDescriptionText: 'mock-description',
          alertSeverityLevel: AlertSeverityLevelType.Warning,
        },
      ],
    });
    expect(container.querySelector('.alert-text').textContent).toContain(
      'mock-description',
    );
  });
});
