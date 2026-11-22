import { renderWithProviders } from '../../../helpers/mock-providers';
import StopPageMap from '../../../../../src/client/component/map/StopPageMap';

describe('<StopPageMap />', () => {
  it('should render empty if stop information is missing', () => {
    const props = {
      params: { stopId: 'HSL:2211275' },
      routes: [],
      stop: null,
      mapLayers: { stop: {}, terminal: {} },
      mapLayerOptions: {},
    };
    const { container } = renderWithProviders(<StopPageMap {...props} />);
    expect(container.querySelector('.map')).toBeNull();
  });
});
