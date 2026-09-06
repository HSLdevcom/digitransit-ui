import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import NoDisruptions from '../../../../app/component/trafficnow/components/NoDisruptions';
import * as useLogo from '../../../../app/hooks/useLogo';

const baseConfig = {
  CONFIG: 'default',
  notFoundGraphic: null,
  colors: { primary: '#007ac9' },
};

describe('<NoDisruptions />', () => {
  let logoStub;

  beforeEach(() => {
    logoStub = vi
      .spyOn(useLogo, 'useLogo')
      .mockReturnValue({ logo: null, loading: false });
  });

  afterEach(() => logoStub.mockRestore());

  describe('Graphic rendering', () => {
    it('renders the fallback Icon when no logo is available', () => {
      const { container } = renderWithProviders(<NoDisruptions />, {
        config: baseConfig,
      });
      expect(container.querySelectorAll('svg')).toHaveLength(1);
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });

    it('renders an img tag when a logo URL is available', () => {
      logoStub.mockReturnValue({
        logo: '/path/to/some-graphic.svg',
        loading: false,
      });
      const { container } = renderWithProviders(<NoDisruptions />, {
        config: { ...baseConfig, notFoundGraphic: 'some-graphic.svg' },
      });
      expect(container.querySelectorAll('img')).toHaveLength(1);
      expect(container.querySelectorAll('svg')).toHaveLength(0);
    });
  });
});
