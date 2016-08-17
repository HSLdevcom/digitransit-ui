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
  const cssRule = mode && getSelector(`.${mode.toLowerCase()}`);
  return cssRule && cssRule.style.color;
});

/* eslint-disable no-param-reassign */
export function drawRoundIcon(tile, geom, type, large, platformNumber) {
  const scale = large ? 2 : 1;

  const caseRadius = getCaseRadius({ $zoom: tile.coords.z }) * scale;

  const stopRadius = getStopRadius({ $zoom: tile.coords.z }) * scale;

  const hubRadius = getHubRadius({ $zoom: tile.coords.z }) * scale;

  if (caseRadius > 0) {
    tile.ctx.beginPath();
    tile.ctx.fillStyle = '#fff';

    tile.ctx.arc(
      geom[0][0].x / tile.ratio,
      geom[0][0].y / tile.ratio,
      caseRadius * tile.scaleratio, 0, Math.PI * 2
    );

    tile.ctx.fill();
    tile.ctx.beginPath();
    tile.ctx.fillStyle = getColor(type);

    tile.ctx.arc(
      geom[0][0].x / tile.ratio,
      geom[0][0].y / tile.ratio,
      stopRadius * tile.scaleratio, 0, Math.PI * 2
    );

    tile.ctx.fill();

    if (hubRadius > 0) {
      tile.ctx.beginPath();
      tile.ctx.fillStyle = '#fff';

      tile.ctx.arc(
        geom[0][0].x / tile.ratio,
        geom[0][0].y / tile.ratio,
        hubRadius * tile.scaleratio, 0, Math.PI * 2
      );

      tile.ctx.fill();

      if (platformNumber && hubRadius > 8) {
        tile.ctx.font = `${1.2 * hubRadius * tile.scaleratio
          }px Gotham XNarrow SSm A, Gotham XNarrow SSm B, Arial, sans-serif`;
        tile.ctx.fillStyle = '#333';
        tile.ctx.textAlign = 'center';
        tile.ctx.textBaseline = 'middle';
        tile.ctx.fillText(platformNumber, geom[0][0].x / tile.ratio, geom[0][0].y / tile.ratio);
      }
    }
  }
}
