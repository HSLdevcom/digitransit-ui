import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import TrafficNowHeader from '../../../../app/component/trafficnow/TrafficNowHeader';
import * as withBreakpoint from '../../../../utils/client/withBreakpoint';
import * as assetUrl from '../../../../app/client/assetUrl';

// found's <Link> is globally stubbed (test/unit/helpers/vitest.setup.js) to render only
// its children, with no wrapping <a>/href — so the "fallback to Link" branch of
// the breadcrumb can only be asserted on by its rendered text, not by an href.
const baseConfig = createTestConfig({
  trafficNowHeaderGraphic: null,
  colors: { primary: '#007ac9' },
  URL: {
    HOLIDAYS_AND_EXCEPTIONS: { fi: 'https://example.com/holidays' },
  },
  language: 'fi',
});

describe('<TrafficNowHeader />', () => {
  beforeEach(() => {
    // sinon can't stub this repo's own ESM exports; vi.spyOn can (auto-
    // restored via the `restoreMocks: true` Vitest config option).
    vi.spyOn(withBreakpoint, 'useBreakpoint').mockReturnValue('large');
    // Outside a webpack build getAssetUrl always returns undefined, so the
    // "logo available" branch has to be stubbed in.
    vi.spyOn(assetUrl, 'default').mockReturnValue(undefined);
  });

  const renderHeader = (config = baseConfig) =>
    renderWithProviders(<TrafficNowHeader />, { config });

  describe('Desktop vs mobile class', () => {
    it('does not apply --mobile modifier on large breakpoint', () => {
      const { container } = renderHeader();
      expect(
        container.querySelector('.traffic-now__header--mobile'),
      ).toBeNull();
    });

    it('applies --mobile modifier on small breakpoint', () => {
      withBreakpoint.useBreakpoint.mockReturnValue('small');
      const { container } = renderHeader();
      expect(
        container.querySelector('.traffic-now__header--mobile'),
      ).not.toBeNull();
    });
  });

  describe('Header logo image', () => {
    it('renders the logo <img> on desktop when a logo URL is available', () => {
      assetUrl.default.mockReturnValue('/path/to/header.svg');
      const { container } = renderHeader();
      expect(container.querySelectorAll('img')).toHaveLength(1);
    });

    it('does not render the logo <img> on mobile even when a logo is available', () => {
      withBreakpoint.useBreakpoint.mockReturnValue('small');
      assetUrl.default.mockReturnValue('/path/to/header.svg');
      const { container } = renderHeader();
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });

    it('does not render the logo <img> on desktop when no logo is available', () => {
      assetUrl.default.mockReturnValue(undefined);
      const { container } = renderHeader();
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });
  });

  describe('Breadcrumb link', () => {
    it('falls back to the "/" Link (no href to assert) when trafficNowRootPath is not defined', () => {
      const { container } = renderHeader();
      const breadcrumb = container.querySelector(
        '.traffic-now__header-breadcrumb',
      );
      // No trafficNowRootPath => the plain <a> branch is skipped and the
      // (globally stubbed) found Link branch renders instead, so no <a> exists.
      expect(breadcrumb.querySelector('a')).toBeNull();
      expect(breadcrumb.textContent).toContain('Travelling');
    });

    it('links to ROOTLINK + trafficNowRootPath when defined', () => {
      const { container } = renderHeader({
        ...baseConfig,
        CONFIG: 'hsl',
        trafficNowRootPath: {
          fi: '/matkustaminen',
          sv: '/sv/att-resa',
          en: '/en/travelling',
        },
        URL: { ...baseConfig.URL, ROOTLINK: 'https://www.hsl.fi' },
      });
      const breadcrumb = container.querySelector(
        '.traffic-now__header-breadcrumb a',
      );
      expect(breadcrumb).not.toBeNull();
      expect(breadcrumb.getAttribute('href')).toBe(
        'https://www.hsl.fi/matkustaminen',
      );
    });

    it('links using the localized path for the current language', () => {
      const { container } = renderHeader({
        ...baseConfig,
        CONFIG: 'hsl',
        language: 'sv',
        trafficNowRootPath: {
          fi: '/matkustaminen',
          sv: '/sv/att-resa',
          en: '/en/travelling',
        },
        URL: { ...baseConfig.URL, ROOTLINK: 'https://www.hsl.fi' },
      });
      const breadcrumb = container.querySelector(
        '.traffic-now__header-breadcrumb a',
      );
      expect(breadcrumb).not.toBeNull();
      expect(breadcrumb.getAttribute('href')).toBe(
        'https://www.hsl.fi/sv/att-resa',
      );
    });
  });

  describe('HSL-specific AdditionalDescription', () => {
    it('renders AdditionalDescription when CONFIG is hsl', () => {
      const { container } = renderHeader({ ...baseConfig, CONFIG: 'hsl' });
      const link = Array.from(container.querySelectorAll('a')).find(a =>
        a.textContent.includes('holidays and exceptions'),
      );
      expect(link).toBeDefined();
      expect(link.getAttribute('href')).toBe('https://example.com/holidays');
    });

    it('does not render AdditionalDescription when CONFIG is not hsl', () => {
      const { container } = renderHeader({ ...baseConfig, CONFIG: 'default' });
      expect(container.textContent).not.toContain('holidays and exceptions');
    });
  });
});
