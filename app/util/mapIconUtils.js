import memoize from 'lodash/memoize';
import glfun from 'mapbox-gl-function';
import { parseCSSColor } from 'csscolorparser';
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
      geom.x / tile.ratio,
      geom.y / tile.ratio,
      caseRadius * tile.scaleratio, 0, Math.PI * 2
    );
    tile.ctx.fill();

    tile.ctx.beginPath();
    tile.ctx.fillStyle = getColor(type);
    tile.ctx.arc(
      geom.x / tile.ratio,
      geom.y / tile.ratio,
      stopRadius * tile.scaleratio, 0, Math.PI * 2
    );
    tile.ctx.fill();

    if (hubRadius > 0) {
      tile.ctx.beginPath();
      tile.ctx.fillStyle = '#fff';
      tile.ctx.arc(
        geom.x / tile.ratio,
        geom.y / tile.ratio,
        hubRadius * tile.scaleratio, 0, Math.PI * 2
      );
      tile.ctx.fill();

      // The text requires 14 pixels in width, so we draw if the hub radius is at least half of that
      if (platformNumber && hubRadius > 7) {
        tile.ctx.font = `${1.2 * hubRadius * tile.scaleratio
          }px Gotham XNarrow SSm A, Gotham XNarrow SSm B, Arial, sans-serif`;
        tile.ctx.fillStyle = '#333';
        tile.ctx.textAlign = 'center';
        tile.ctx.textBaseline = 'middle';
        tile.ctx.fillText(platformNumber, geom.x / tile.ratio, geom.y / tile.ratio);
      }
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
      geom.x / tile.ratio, geom.y / tile.ratio, 0,
      geom.x / tile.ratio, geom.y / tile.ratio, haloRadius * tile.scaleratio
    );
    gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`);
    gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
    // eslint-disable-next-line no-param-reassign
    tile.ctx.fillStyle = gradient;
    tile.ctx.fillRect(
      (geom.x / tile.ratio) - (haloRadius * tile.scaleratio),
      (geom.y / tile.ratio) - (haloRadius * tile.scaleratio),
      haloRadius * tile.scaleratio * 2,
      haloRadius * tile.scaleratio * 2
    );

    tile.ctx.beginPath();
    // eslint-disable-next-line no-param-reassign
    tile.ctx.fillStyle = '#fff';
    tile.ctx.arc(
      geom.x / tile.ratio,
      geom.y / tile.ratio,
      caseRadius * tile.scaleratio, 0, Math.PI * 2
    );
    tile.ctx.fill();

    tile.ctx.beginPath();
    // eslint-disable-next-line no-param-reassign
    tile.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    tile.ctx.arc(
      geom.x / tile.ratio,
      geom.y / tile.ratio,
      (caseRadius + 1) * tile.scaleratio, 0, Math.PI * 2
    );
    tile.ctx.stroke();

    tile.ctx.beginPath();
    // eslint-disable-next-line no-param-reassign
    tile.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
    tile.ctx.arc(
      geom.x / tile.ratio,
      geom.y / tile.ratio,
      stopRadius * tile.scaleratio, 0, Math.PI * 2
    );
    tile.ctx.fill();

    if (stopRadius > 6) {
      const iconSize = (stopRadius - 2) * tile.scaleratio;
      const img = getImageFromSpriteInternal('icon-icon_station', iconSize, iconSize, 'white');
      img.onload = function draw() {
        tile.ctx.drawImage(
          this,
          (geom.x / tile.ratio) - (iconSize / 2),
          (geom.y / tile.ratio) - (iconSize / 2),
        );
      };

      if (name) {
        /* eslint-disable no-param-reassign */
        tile.ctx.fillStyle = '#333';
        tile.ctx.strokeStyle = 'white';
        tile.ctx.lineWidth = 2 * tile.scaleratio;
        tile.ctx.textAlign = 'center';
        tile.ctx.textBaseline = 'top';
        tile.ctx.font = `500 ${11 * tile.scaleratio}px
          Gotham Rounded SSm A, Gotham Rounded SSm B, Arial, Georgia, Serif`;
        tile.ctx.strokeText(
          name,
          geom.x / tile.ratio,
          (geom.y / tile.ratio) + ((caseRadius + 1) * tile.scaleratio));
        tile.ctx.fillText(
          name,
          geom.x / tile.ratio,
          (geom.y / tile.ratio) + ((caseRadius + 1) * tile.scaleratio));
      }
    }
  }
}
