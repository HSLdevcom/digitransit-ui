import fetchMock from 'fetch-mock';
import sinon from 'sinon';

import { AlertSeverityLevelType } from '../../../../../app/constants';
import Stops from '../../../../../app/component/map/tile-layer/Stops';
import * as mapIconUtils from '../../../../../app/util/mapIconUtils';
import * as mapLayerUtils from '../../../../../app/util/mapLayerUtils';

describe('Stops', () => {
  const config = {
    URL: {
      STOP_MAP: 'https://localhost/stopmap/',
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
      const mock = fetchMock.get(`${config.URL.STOP_MAP}3/1/2.pbf`, {
        status: 404,
      });
      new Stops(tile, config, []); // eslint-disable-line no-new
      expect(mock.called()).to.equal(true);
    });

    it('should add zoom offset to the z coordinate', () => {
      const mock = fetchMock.get(`${config.URL.STOP_MAP}4/1/2.pbf`, {
        status: 404,
      });
      new Stops({ ...tile, props: { zoomOffset: 1 } }, config, []); // eslint-disable-line no-new
      expect(mock.called()).to.equal(true);
    });

    it('should retrieve alert data for the given stop', done => {
      const gtfsId = 'HSL:1172143';
      fetchMock.get(`${config.URL.STOP_MAP}3/1/2.pbf`, {
        status: 404,
      });
      fetchMock.post('/graphql', {
        data: {
          stop: {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Info,
              },
            ],
          },
        },
      });

      const layer = new Stops(tile, config, []);
      layer.drawStop = (stopFeature, large, alertSeverityLevel) => {
        expect(stopFeature.properties.gtfsId).to.equal(gtfsId);
        expect(alertSeverityLevel).to.equal(AlertSeverityLevelType.Info);
        done();
      };
      layer.fetchStatusAndDrawStop({ properties: { gtfsId } });
    });

    it('should attempt to draw an icon with an alert badge', () => {
      fetchMock.get(`${config.URL.STOP_MAP}3/1/2.pbf`, {
        status: 404,
      });
      const featureLayerStub = sinon
        .stub(mapLayerUtils, 'isFeatureLayerEnabled')
        .callsFake(() => true);
      const iconStub = sinon
        .stub(mapIconUtils, 'drawRoundIcon')
        .callsFake(() => ({ iconRadius: 10 }));
      const badgeStub = sinon.stub(mapIconUtils, 'drawRoundIconAlertBadge');

      const layer = new Stops(tile, config, [{ stop: { BUS: true } }]);
      layer.drawStop(
        {
          properties: {
            type: 'BUS',
          },
        },
        false,
        AlertSeverityLevelType.Warning,
      );

      expect(iconStub.called).to.equal(true);
      expect(badgeStub.called).to.equal(true);

      featureLayerStub.restore();
      iconStub.restore();
      badgeStub.restore();
    });
  });
});
