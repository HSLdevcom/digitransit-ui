import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';
import StopCardHeader from '../../../app/component/stop/StopCardHeader';

describe('<StopCardHeader />', () => {
  const baseConfig = {
    ...mockContext.config,
    stopCard: { header: {} },
    colors: { primary: '#000000' },
  };

  it('should not render the zone icon if zoneId is missing', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: null,
      },
    };
    const { container } = renderWithProviders(<StopCardHeader {...props} />, {
      config: { ...baseConfig, zones: { stops: true } },
    });
    expect(container.querySelector('.zone-icon-container')).to.equal(null);
  });

  it('should not render the virtual monitor if so configured', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: 'A',
      },
      className: 'stop-page header',
    };
    const { container } = renderWithProviders(<StopCardHeader {...props} />, {
      config: {
        ...baseConfig,
        stopCard: { header: { virtualMonitorBaseUrl: '' } },
        zones: { stops: false },
        allowLogin: false,
      },
    });
    expect(container.querySelector('.external-link-container')).to.equal(null);
  });

  it('should not render the zone icon if so configured', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: 'A',
      },
    };
    const { container } = renderWithProviders(<StopCardHeader {...props} />, {
      config: { ...baseConfig, zones: { stops: false } },
    });
    expect(container.querySelector('.zone-icon-container')).to.equal(null);
  });
});
