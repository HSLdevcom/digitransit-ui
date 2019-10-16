import sinon from 'sinon';

import * as utils from '../../../app/util/mapIconUtils';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('mapIconUtils', () => {
  describe('drawRoundIcon', () => {
    const tile = {
      coords: {
        z: 12,
      },
      ctx: {
        arc: sinon.stub(),
        beginPath: sinon.stub(),
        fill: sinon.stub(),
        fillText: sinon.stub(),
      },
      ratio: 1,
      scaleratio: 1,
    };

    const geometry = {
      x: 1,
      y: 1,
    };

    it('should return the icon radius', () => {
      const { iconRadius } = utils.drawRoundIcon(
        tile,
        geometry,
        'BUS',
        1,
        undefined,
      );
      expect(iconRadius).to.equal(1);
    });

    it('should take the scaleratio into account', () => {
      const { iconRadius } = utils.drawRoundIcon(
        { ...tile, scaleratio: 2 },
        geometry,
        'BUS',
        1,
        undefined,
      );
      expect(iconRadius).to.equal(2);
    });

    it('should allow custom scale', () => {
      const { iconRadius } = utils.drawRoundIcon(
        tile,
        geometry,
        'BUS',
        2.5,
        undefined,
      );
      expect(iconRadius).to.equal(2.5);
    });

    it('should use different font sizes depending on the platformNumber length', () => {
      const getFontSize = font => Number(font.split('px')[0]);
      const platformTile = {
        ...tile,
        coords: {
          z: 18,
        },
      };

      utils.drawRoundIcon(platformTile, geometry, 'BUS', 1, '12');
      const large = getFontSize(platformTile.ctx.font);

      utils.drawRoundIcon(platformTile, geometry, 'BUS', 1, '123');
      const medium = getFontSize(platformTile.ctx.font);

      utils.drawRoundIcon(platformTile, geometry, 'BUS', 1, '1234');
      const small = getFontSize(platformTile.ctx.font);

      expect(large > medium && medium > small).to.equal(true);
    });
  });

  describe('drawRoundIconAlertBadge', () => {
    let tile;
    let getImageStub;

    beforeEach(() => {
      tile = {
        ctx: {
          arc: sinon.stub(),
          beginPath: sinon.stub(),
          drawImage: sinon.stub(),
          fill: sinon.stub(),
        },
      };
      getImageStub = sinon.stub();
    });

    it('should not draw anything if alertSeverityLevel is falsy', async () => {
      await utils.drawRoundIconAlertBadge(
        tile,
        {},
        10,
        undefined,
        getImageStub,
      );
      expect(tile.ctx.drawImage.called).to.equal(false);
    });

    it('should not draw anything if the badge would be too small', async () => {
      await utils.drawRoundIconAlertBadge(
        tile,
        {},
        4,
        AlertSeverityLevelType.Info,
        getImageStub,
      );
      expect(tile.ctx.drawImage.called).to.equal(false);
    });

    it('should retrieve the right icon for caution and draw the badge', async () => {
      await utils.drawRoundIconAlertBadge(
        tile,
        {},
        10,
        AlertSeverityLevelType.Warning,
        getImageStub,
      );
      expect(getImageStub.calledOnce).to.equal(true);
      expect(getImageStub.args[0][0]).to.contain('caution-badge-with-halo');
      expect(tile.ctx.arc.called).to.equal(false);
      expect(tile.ctx.beginPath.called).to.equal(false);
      expect(tile.ctx.drawImage.called).to.equal(true);
      expect(tile.ctx.fill.called).to.equal(false);
    });

    it('should retrieve the right icon for info and draw the badge', async () => {
      await utils.drawRoundIconAlertBadge(
        tile,
        {},
        10,
        AlertSeverityLevelType.Info,
        getImageStub,
      );
      expect(getImageStub.calledOnce).to.equal(true);
      expect(getImageStub.args[0][0]).to.contain('info');
      expect(tile.ctx.arc.called).to.equal(true);
      expect(tile.ctx.beginPath.called).to.equal(true);
      expect(tile.ctx.drawImage.called).to.equal(true);
      expect(tile.ctx.fill.called).to.equal(true);
    });
  });
});
