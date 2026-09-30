import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import NoDisruptions from '../../../../app/component/trafficnow/components/NoDisruptions';
import * as assetUrl from '../../../../app/client/assetUrl';

const baseConfig = createTestConfig({
  notFoundGraphic: null,
  colors: { primary: '#007ac9' },
});

describe('<NoDisruptions />', () => {
  let logoStub;

  beforeEach(() => {
    // Outside a webpack build getAssetUrl always returns undefined, so the
    // "logo available" branch has to be stubbed in.
    logoStub = vi.spyOn(assetUrl, 'default').mockReturnValue(undefined);
  });

  describe('Graphic rendering', () => {
    it('renders the fallback Icon when no logo is available', () => {
      const { container } = renderWithProviders(<NoDisruptions />, {
        config: baseConfig,
      });
      expect(container.querySelectorAll('svg')).toHaveLength(1);
      expect(container.querySelectorAll('img')).toHaveLength(0);
    });

    it('renders an img tag when a logo URL is available', () => {
      logoStub.mockReturnValue('/path/to/some-graphic.svg');
      const { container } = renderWithProviders(<NoDisruptions />, {
        config: { ...baseConfig, notFoundGraphic: 'some-graphic.svg' },
      });
      expect(container.querySelectorAll('img')).toHaveLength(1);
      expect(container.querySelectorAll('svg')).toHaveLength(0);
    });
  });
});
