import memoize from 'lodash/memoize';
import glfun from 'mapbox-gl-function';
import getSelector from './get-selector';

export const getCaseRadius = memoize(glfun({
  type: 'exponential',
  base: 1.15,
  domain: [11.9, 12, 22],
  range: [0, 1.5, 26],
}));

export const getStopRadius = memoize(glfun({
  type: 'exponential',
  base: 1.15,
  domain: [11.9, 12, 22],
  range: [0, 1, 24],
}));

export const getHubRadius = memoize(glfun({
  type: 'exponential',
  base: 1.15,
  domain: [14, 14.1, 22],
  range: [0, 2, 20],
}));

export const getColor = memoize((mode) => {
  if (typeof mode === 'undefined' || mode == null) {
    return undefined;
  }
  const ref = getSelector(`.${mode.toLowerCase()}`);
  return ref != null ? ref.style.color : void 0;
});

export function drawRoundIcon(tile, geom, type) {
  const caseRadius = getCaseRadius({ $zoom: tile.coords.z });

  const stopRadius = getStopRadius({ $zoom: tile.coords.z });

  const hubRadius = getHubRadius({ $zoom: tile.coords.z });

  if (caseRadius > 0) {
    tile.ctx.beginPath();
    tile.ctx.fillStyle = '#fff'; // eslint-disable-line no-param-reassign

    tile.ctx.arc(
      geom[0][0].x / tile.ratio,
      geom[0][0].y / tile.ratio,
      caseRadius * tile.scaleratio, 0, Math.PI * 2
    );

    tile.ctx.fill();
    tile.ctx.beginPath();
    tile.ctx.fillStyle = getColor(type); // eslint-disable-line no-param-reassign

    tile.ctx.arc(
      geom[0][0].x / tile.ratio,
      geom[0][0].y / tile.ratio,
      stopRadius * tile.scaleratio, 0, Math.PI * 2
    );

    tile.ctx.fill();

    if (hubRadius > 0) {
      tile.ctx.beginPath();
      tile.ctx.fillStyle = '#fff'; // eslint-disable-line no-param-reassign

      tile.ctx.arc(
        geom[0][0].x / tile.ratio,
        geom[0][0].y / tile.ratio,
        hubRadius * tile.scaleratio, 0, Math.PI * 2
      );

      tile.ctx.fill();
    }
  }
}
