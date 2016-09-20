import memoize from 'lodash/memoize';
import glfun from 'mapbox-gl-function';
import { parseCSSColor } from 'csscolorparser';
import getSelector from './get-selector';

export const getCaseRadius = memoize(glfun({
  type: 'exponential',
  base: 1.15,
  domain: [11.9, 12, 22],
  range: [0, 1.5, 26],
}), ({ $zoom }) => $zoom);

export const getStopRadius = memoize(glfun({
  type: 'exponential',
  base: 1.15,
  domain: [11.9, 12, 22],
  range: [0, 1, 24],
}), ({ $zoom }) => $zoom);

export const getHubRadius = memoize(glfun({
  type: 'exponential',
  base: 1.15,
  domain: [14, 14.1, 22],
  range: [0, 2, 20],
}), ({ $zoom }) => $zoom);

export const getColor = memoize((mode) => {
  const cssRule = mode && getSelector(`.${mode.toLowerCase()}`);
  return cssRule && cssRule.style.color;
});

function getImageFromSpriteSync(icon, width, height, fill) {
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

function getImageFromSpriteAsync(icon, width, height, fill) {
  return new Promise((resolve) => {
    const image = getImageFromSpriteSync(icon, width, height, fill);
    image.onload = () => resolve(image);
  });
}

const getImageFromSpriteCache = memoize(
  getImageFromSpriteAsync,
  (icon, w, h, fill) => `${icon}_${w}_${h}_${fill}`
);

function drawIconImage(image, tile, geom, width, height) {
  tile.ctx.drawImage(
    image,
    (geom.x / tile.ratio) - (width / 2),
    (geom.y / tile.ratio) - (height / 2)
  );
}

function calculateIconBadgePosition(coord, tile, imageSize, badgeSize, scaleratio) {
  return ((coord / tile.ratio) -
    (imageSize / 2) - (badgeSize / 2)) + (2 * scaleratio);
}

function drawIconImageBadge(image, tile, geom, imageSize, badgeSize, scaleratio) {
  tile.ctx.drawImage(
    image,
    calculateIconBadgePosition(geom.x, tile, imageSize, badgeSize, scaleratio),
    calculateIconBadgePosition(geom.y, tile, imageSize, badgeSize, scaleratio)
  );
}

/* eslint-disable no-param-reassign */
/* eslint-disable require-yield */
export async function drawRoundIcon(tile, geom, type, large, platformNumber) {
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

export async function drawTerminalIcon(tile, geom, type, name) {
  const stopRadius = getStopRadius({ $zoom: tile.coords.z }) * 2.5;
  if (stopRadius <= 0) return;

  const iconSize = (stopRadius - 2) * tile.scaleratio;
  const image = await getImageFromSpriteCache('icon-icon_station', iconSize, iconSize, 'white');
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
    tile.ctx.drawImage(
      image,
      (geom.x / tile.ratio) - (iconSize / 2),
      (geom.y / tile.ratio) - (iconSize / 2),
    );

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

export async function drawParkAndRideIcon(tile, geom, width, height) {
  const image = await getImageFromSpriteCache('icon-icon_park-and-ride', width, height);
  drawIconImage(image, tile, geom, width, height);
}

export async function drawCitybikeIcon(tile, geom, imageSize) {
  const image = await getImageFromSpriteCache('icon-icon_citybike', imageSize, imageSize);
  drawIconImage(image, tile, geom, imageSize, imageSize);
}

export async function drawCitybikeNotInUseIcon(tile, geom, imageSize) {
  const image = await getImageFromSpriteCache('icon-icon_not-in-use', imageSize, imageSize);
  drawIconImage(image, tile, geom, imageSize, imageSize);
}

export async function drawAvailabilityBadge(availability, tile, geom, imageSize,
  badgeSize, scaleratio) {
  if (availability !== 'good' && availability !== 'poor' && availability !== 'no') {
    throw Error("Supported badges are 'good', 'poor', and 'no'");
  }

  const image = await getImageFromSpriteCache(`icon-icon_${availability}-availability`,
    badgeSize, badgeSize);
  drawIconImageBadge(image, tile, geom, imageSize, badgeSize, scaleratio);
}
