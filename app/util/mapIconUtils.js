import memoize from 'lodash/memoize';
import glfun from 'mapbox-gl-function';
import getSelector from './get-selector';
import { parseCSSColor } from 'csscolorparser';

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

export function drawRoundIcon(tile, geom, type, large) {
  const scale = large ? 2 : 1;
  const caseRadius = getCaseRadius({ $zoom: tile.coords.z }) * scale;
  const stopRadius = getStopRadius({ $zoom: tile.coords.z }) * scale;
  const hubRadius = getHubRadius({ $zoom: tile.coords.z }) * scale;

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

function getImageFromSpriteInternal(icon, width, height, fill) {
  if (!document) { return null; }
  const symbol = document.getElementById(icon);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  const vb = symbol.viewBox.baseVal;
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
  if (fill) svg.setAttribute('fill', fill);
  // TODO: Simplify after https://github.com/Financial-Times/polyfill-service/pull/722 is merged
  Array.prototype.forEach.call(symbol.childNodes, node => svg.appendChild(node.cloneNode(true)));
  const image = new Image(width, height);
  image.src = `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(svg))}`;
  return image;
}

export const getImageFromSprite = memoize(
  getImageFromSpriteInternal,
  (icon, w, h, fill) => `${icon}_${w}_${h}_${fill}`
);

export function drawTerminalIcon(tile, geom, type, name) {
  const stopRadius = getStopRadius({ $zoom: tile.coords.z }) * 2.5;

  if (stopRadius > 0) {
    const caseRadius = stopRadius + 1;
    const haloRadius = stopRadius * 2.5;
    const color = parseCSSColor(getColor(type));

    const gradient = tile.ctx.createRadialGradient(
      geom[0][0].x / tile.ratio, geom[0][0].y / tile.ratio, 0,
      geom[0][0].x / tile.ratio, geom[0][0].y / tile.ratio, haloRadius
    );
    gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`);
    gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
    // eslint-disable-next-line no-param-reassign
    tile.ctx.fillStyle = gradient;
    tile.ctx.fillRect(
      geom[0][0].x / tile.ratio - haloRadius,
      geom[0][0].y / tile.ratio - haloRadius,
      haloRadius * 2,
      haloRadius * 2
    );

    tile.ctx.beginPath();
    // eslint-disable-next-line no-param-reassign
    tile.ctx.fillStyle = '#fff';
    tile.ctx.arc(
      geom[0][0].x / tile.ratio,
      geom[0][0].y / tile.ratio,
      caseRadius * tile.scaleratio, 0, Math.PI * 2
    );
    tile.ctx.fill();

    tile.ctx.beginPath();
    // eslint-disable-next-line no-param-reassign
    tile.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    tile.ctx.arc(
      geom[0][0].x / tile.ratio,
      geom[0][0].y / tile.ratio,
      (caseRadius + 1) * tile.scaleratio, 0, Math.PI * 2
    );
    tile.ctx.stroke();

    tile.ctx.beginPath();
    // eslint-disable-next-line no-param-reassign
    tile.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
    tile.ctx.arc(
      geom[0][0].x / tile.ratio,
      geom[0][0].y / tile.ratio,
      stopRadius * tile.scaleratio, 0, Math.PI * 2
    );
    tile.ctx.fill();

    if (stopRadius > 6) {
      const iconSize = stopRadius - 2;
      tile.ctx.drawImage(
        getImageFromSprite('icon-icon_station', iconSize, iconSize, 'white'),
        geom[0][0].x / tile.ratio - iconSize / 2,
        geom[0][0].y / tile.ratio - iconSize / 2,
      );

      if (name) {
        /* eslint-disable no-param-reassign */
        tile.ctx.fillStyle = '#777';
        tile.ctx.strokeStyle = 'white';
        tile.ctx.textAlign = 'center';
        tile.ctx.textBaseline = 'top';
        tile.ctx.font =
          '500 11px Gotham Rounded SSm A, Gotham Rounded SSm B, Arial, Georgia, Serif';
        tile.ctx.strokeText(
        name,
        geom[0][0].x / tile.ratio,
        geom[0][0].y / tile.ratio + caseRadius + 1);
        tile.ctx.fillText(
        name,
        geom[0][0].x / tile.ratio,
        geom[0][0].y / tile.ratio + caseRadius + 1);
      }
    }
  }
}
