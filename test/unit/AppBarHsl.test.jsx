import { renderWithProviders } from './helpers/mock-providers';
import AppBarHsl, { Component } from '../../app/component/AppBarHsl';

describe('<AppBarHsl />', () => {
  beforeEach(() => {
    // The site header fetches its config on mount. The request never
    // resolves, so the test stays off the network and no response arrives
    // after it has ended.
    vi.spyOn(window, 'fetch').mockReturnValue(new Promise(() => {}));
  });

  it('preserves the Component export alias', () => {
    expect(Component).toBe(AppBarHsl);
  });

  it('should render without errors', () => {
    const { container } = renderWithProviders(<AppBarHsl />, {
      config: {
        CONFIG: 'default',
        allowLogin: false,
        URL: { ROOTLINK: 'http://www.foo.com' },
        user: {},
        // Required by the real (unstubbed) @hsl-fi/site-header component -
        // it indexes its own translations object by this value.
        language: 'fi',
      },
    });
    expect(container).not.toBeNull();
  });
});
