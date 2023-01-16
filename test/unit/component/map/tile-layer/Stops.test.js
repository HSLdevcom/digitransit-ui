import fetchMock from 'fetch-mock';
import Stops from '../../../../../app/component/map/tile-layer/Stops';

describe('Stops', () => {
  const config = {
    URL: {
      STOP_MAP: { default: 'https://localhost/stopmap/' },
    },
  };

  const tile = {
    coords: {
      x: 1,
      y: 2,
      z: 3,
    },
    props: {},
  };

  describe('fetchStatusAndDrawStop', () => {
    afterEach(() => {
      fetchMock.reset();
    });

    it('should make a get to the correct url', () => {
      const mock = fetchMock.get(`${config.URL.STOP_MAP.default}3/1/2.pbf`, {
        status: 404,
      });
      new Stops(tile, config, []).getPromise(); // eslint-disable-line no-new
      expect(mock.called()).to.equal(true);
    });

    it('should add zoom offset to the z coordinate', () => {
      const mock = fetchMock.get(`${config.URL.STOP_MAP.default}4/1/2.pbf`, {
        status: 404,
      });
      new Stops({ ...tile, props: { zoomOffset: 1 } }, config, []).getPromise(); // eslint-disable-line no-new
      expect(mock.called()).to.equal(true);
    });
  });
});
