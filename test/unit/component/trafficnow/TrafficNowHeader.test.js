import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import sinon from 'sinon';
import { renderWithProviders } from '../../helpers/mock-providers';
import TrafficNowHeader from '../../../../app/component/trafficnow/TrafficNowHeader';
import * as withBreakpoint from '../../../../utils/client/withBreakpoint';
import * as useLogo from '../../../../app/hooks/useLogo';

// found's <Link> is globally stubbed (test/unit/helpers/init.js) to render only
// its children, with no wrapping <a>/href — so the "fallback to Link" branch of
// the breadcrumb can only be asserted on by its rendered text, not by an href.
const baseConfig = {
  CONFIG: 'default',
  trafficNowHeaderGraphic: null,
  colors: { primary: '#007ac9' },
  URL: {
    HOLIDAYS_AND_EXCEPTIONS: { fi: 'https://example.com/holidays' },
  },
  language: 'fi',
};

describe('<TrafficNowHeader />', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(withBreakpoint, 'useBreakpoint').returns('large');
    sandbox.stub(useLogo, 'useLogo').returns({ logo: null, loading: false });
  });

  afterEach(() => sandbox.restore());

  const renderHeader = (config = baseConfig) =>
    renderWithProviders(<TrafficNowHeader />, { config });

  describe('Desktop vs mobile class', () => {
    it('does not apply --mobile modifier on large breakpoint', () => {
      const { container } = renderHeader();
      expect(container.querySelector('.traffic-now__header--mobile')).to.equal(
        null,
      );
    });

    it('applies --mobile modifier on small breakpoint', () => {
      withBreakpoint.useBreakpoint.returns('small');
      const { container } = renderHeader();
      expect(
        container.querySelector('.traffic-now__header--mobile'),
      ).to.not.equal(null);
    });
  });

  describe('Header logo image', () => {
    it('renders the logo <img> on desktop when a logo URL is returned by useLogo', () => {
      useLogo.useLogo.returns({ logo: '/path/to/header.svg', loading: false });
      const { container } = renderHeader();
      expect(container.querySelectorAll('img')).to.have.lengthOf(1);
    });

    it('does not render the logo <img> on mobile even when a logo is available', () => {
      withBreakpoint.useBreakpoint.returns('small');
      useLogo.useLogo.returns({ logo: '/path/to/header.svg', loading: false });
      const { container } = renderHeader();
      expect(container.querySelectorAll('img')).to.have.lengthOf(0);
    });

    it('does not render the logo <img> on desktop when no logo is available', () => {
      useLogo.useLogo.returns({ logo: null, loading: false });
      const { container } = renderHeader();
      expect(container.querySelectorAll('img')).to.have.lengthOf(0);
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
      expect(breadcrumb.querySelector('a')).to.equal(null);
      expect(breadcrumb.textContent).to.include('Travelling');
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
      expect(breadcrumb).to.not.equal(null);
      expect(breadcrumb.getAttribute('href')).to.equal(
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
      expect(breadcrumb).to.not.equal(null);
      expect(breadcrumb.getAttribute('href')).to.equal(
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
      expect(link).to.not.equal(undefined);
      expect(link.getAttribute('href')).to.equal(
        'https://example.com/holidays',
      );
    });

    it('does not render AdditionalDescription when CONFIG is not hsl', () => {
      const { container } = renderHeader({ ...baseConfig, CONFIG: 'default' });
      expect(container.textContent).to.not.include('holidays and exceptions');
    });
  });
});
