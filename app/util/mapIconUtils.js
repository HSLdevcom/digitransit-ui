import memoize from 'lodash/memoize';
import getSelector from './get-selector';
import glfun from './glfun';
import { ParkTypes } from '../constants';

/**
 * Corresponds to an arc forming a full circle (Math.PI * 2).
 */
const FULL_CIRCLE = Math.PI * 2;

/**
 * Return icon style, width and height for stop icons
 *
 * @param {string} type one of 'stop', 'citybike', 'hybrid'
 * @param {number} zoom
 * @param {bool} isHilighted
 */
export function getStopIconStyles(type, zoom, isHilighted) {
  const styles = {
    stop: {
      13: {
        style: 'small',
        width: 10,
        height: 10,
      },
      14: {
        style: 'large',
        width: 16,
        height: 22,
      },
      15: {
        style: 'large',
        width: 20,
        height: 27,
      },
      16: {
        style: 'large',
        width: 24,
        height: 33,
      },
    },
    hybrid: {
      13: {
        style: 'small',
        width: 10,
        height: 10,
      },
      14: {
        style: 'large',
        width: 17,
        height: 37,
      },
      15: {
        style: 'large',
        width: 21,
        height: 45,
      },
      16: {
        style: 'large',
        width: 25,
        height: 55,
      },
    },
    citybike: {
      13: {
        style: 'small',
        width: 10,
        height: 10,
      },
      14: {
        style: 'medium',
        width: 16,
        height: 22,
      },
      15: {
        style: 'medium',
        width: 20,
        height: 27,
      },
      16: {
        style: 'large',
        width: 34,
        height: 43,
      },
    },
  };

  if (!styles[type]) {
    return null;
  }
  if (zoom < 16 && isHilighted) {
    // use bigger icon for hilighted stops always
    return styles[type][15];
  }
  if (zoom < 13 && type !== 'citybike') {
    return null;
  }
  if (zoom < 13) {
    return styles[type][13];
  }
  if (zoom > 16) {
    return styles[type][16];
  }
  return styles[type][zoom];
}

/**
 * Get width and height for terminal icons
 *
 * @param {number} zoom
 */
export function getTerminalIconStyles(zoom) {
  const styles = {
    12: {
      width: 12,
      height: 12,
    },
    13: {
      width: 16,
      height: 16,
    },
    14: {
      width: 20,
      height: 20,
    },
    15: {
      width: 24,
      height: 24,
    },
    16: {
      width: 30,
      height: 30,
    },
  };

  if (zoom < 12) {
    return styles[12];
  }
  if (zoom > 16) {
    return styles[16];
  }
  return styles[zoom];
}

export const getCaseRadius = memoize(
  glfun({
    base: 1.15,
    stops: [
      [11.9, 0],
      [12, 1.5],
      [22, 26],
    ],
  }),
);

export const getStopRadius = memoize(
  glfun({
    base: 1.15,
    stops: [
      [11.9, 0],
      [12, 1],
      [22, 24],
    ],
  }),
);

export const getHubRadius = memoize(
  glfun({
    base: 1.15,
    stops: [
      [14, 0],
      [14.1, 2],
      [22, 20],
    ],
  }),
);

export const getMapIconScale = memoize(
  glfun({
    base: 1,
    stops: [
      [13, 0.8],
      [20, 1.6],
    ],
  }),
);

const getStyleOrDefault = (selector, defaultValue = {}) => {
  const cssRule = selector && getSelector(selector.toLowerCase());
  return (cssRule && cssRule.style) || defaultValue;
};

export const getColor = memoize(selector => getStyleOrDefault(selector).color);

export const getFill = memoize(selector => getStyleOrDefault(selector).fill);

export const getModeColor = mode => getColor(`.${mode}`);

/**
 * This function creates an image usind an inlined data:image/svg+xml
 * from an icon. All elements of this icons are pre-processed as follows:
 * * if an element has a style attribute which does not provide a fill property,
 *   the given fill is set
 * * if an element has a class 'modeColor', it's fill attribute is set
 * * if a svg references symbols etc via use, they are inlined
 *   NOTE: external references in files are currently expected as #symbol_id
 *         which will not work in the standalone svgs
 *   NOTE 2: Currently, only one level of use inlining is supported. In future,
 *           recursive inlining might be necessary. Also, only direct children
 *           of type 'use' are inlined.
 * */
function getImageFromSpriteSync(icon, width, height, fill, cssVars) {
  if (!document) {
    return null;
  }
  const symbol = document.getElementById(icon);
  if (!symbol) {
    throw new Error(`Could not find icon '${icon}'`);
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  const vb = symbol.viewBox.baseVal;
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
  if (cssVars) {
    const styleVars = Object.entries(cssVars)
      .map(([name, value]) => `--${name}: ${value}`)
      .join(' ; ');
    svg.setAttribute('style', styleVars);
  }

  // Copy all childNodes from symbol to svg (and set fill style)
  symbol.childNodes.forEach(node => {
    // todo: only direct use children are inlined, not deeper nested ones...
    if (node.nodeName === 'use') {
      const usedSymbolId =
        node.getAttribute('xlink:href') || node.getAttribute('href');
      const usedSymbol = document.getElementById(usedSymbolId.substring(1)); // substring to remove #
      if (!usedSymbol) {
        throw new Error(
          `Could not find icon '${usedSymbolId}' referenced by use in '${icon}'`,
        );
      }
      // todo: here we just deep copy the node, which might use nodes as well, but we don't replace for now
      const inlineSymbol = usedSymbol.cloneNode(true);
      // copy properties from icon to inlineSymbol
      node.attributes.forEach(attr => {
        if (
          !(
            attr.name.startsWith('xmlns') ||
            attr.name.startsWith('href') ||
            attr.name.startsWith('xlink')
          )
        ) {
          inlineSymbol.setAttribute(attr.name, attr.value);
        }
      });
      svg.appendChild(inlineSymbol);
    } else {
      const child = node.cloneNode(true);
      if (node.style && !child.attributes.fill) {
        // TODO this caught me ... What is the reasoning behind this?
        child.style.fill = fill || window.getComputedStyle(node).color;
      }
      svg.appendChild(child);
    }
  });

  if (fill) {
    // todo: instead of setting fill, the svg could make use of vars
    //       and set them on the parent element, e.g. fill: var(--modeColor,#<default>)
    const elements = svg.getElementsByClassName('modeColor');
    for (let i = 0; i < elements.length; i++) {
      elements[i].setAttribute('fill', fill);
    }
  }
  const image = new Image(width, height);
  image.src = `data:image/svg+xml;base64,${btoa(
    new XMLSerializer().serializeToString(svg),
  )}`;
  return image;
}

function getImageFromSpriteAsync(icon, width, height, fill, cssVars) {
  return new Promise(resolve => {
    // TODO: check that icon exists using MutationObserver
    const image = getImageFromSpriteSync(icon, width, height, fill, cssVars);
    image.onload = () => resolve(image);
  });
}

const getImageFromSpriteCache = memoize(
  getImageFromSpriteAsync,
  (icon, w, h, fill, cssVars) =>
    `${icon}_${w}_${h}_${fill}`.concat(
      cssVars != null
        ? Object.entries(cssVars).map(([k, v]) => `_${k}_${v}`)
        : '',
    ),
);

function drawIconImage(image, tile, geom, width, height) {
  tile.ctx.drawImage(
    image,
    geom.x / tile.ratio - width / 2,
    geom.y / tile.ratio - height / 2,
  );
}

function calculateIconBadgePosition(
  coord,
  tile,
  imageSize,
  badgeSize,
  scaleratio,
) {
  return coord / tile.ratio - imageSize / 2 - badgeSize / 2 + 2 * scaleratio;
}

function drawIconImageBadge(
  image,
  tile,
  geom,
  imageSize,
  badgeSize,
  scaleratio,
) {
  tile.ctx.drawImage(
    image,
    calculateIconBadgePosition(geom.x, tile, imageSize, badgeSize, scaleratio),
    calculateIconBadgePosition(geom.y, tile, imageSize, badgeSize, scaleratio),
  );
}

function getSelectedIconCircleOffset(zoom, ratio) {
  if (zoom > 15) {
    return 94 / ratio;
  }
  return 78 / ratio;
}

// eslint-disable-next-line no-unused-vars
function drawSelectionCircle(
  tile,
  x,
  y,
  width,
  height,
  _radius,
  showAvailabilityBadge = false,
) {
  // Change arbitrary offsets and calculate from image dimensions instead
  // const zoom = tile.coords.z - 1;
  // const selectedCircleOffset = getSelectedIconCircleOffset(zoom, tile.ratio);
  // const radius = _radius - 2;
  // const hPos = x + selectedCircleOffset;
  // const vPos = y + 1.85 * selectedCircleOffset;
  tile.ctx.beginPath();
  // eslint-disable-next-line no-param-reassign
  tile.ctx.lineWidth = 2;

  // Deduce radius and offset from image dimensions
  const radius = width / 2;
  const hPos = x + radius / 2;
  const vPos = y + height / 2;
  const arc = FULL_CIRCLE * (showAvailabilityBadge ? 0.75 : 1);
  tile.ctx.arc(hPos, vPos, radius, 0, arc);
  tile.ctx.stroke();
}

export function drawWeatherStationIcon(tile, geom, imageSize) {
  getImageFromSpriteCache('icon-icon_stop_monitor', imageSize, imageSize).then(
    image => {
      drawIconImage(image, tile, geom, imageSize, imageSize);
    },
  );
}

/**
 * Draw a small circle icon used for far away zoom level.
 */
function getSmallStopIcon(type, radius, color) {
  // draw on a new offscreen canvas so that result can be cached
  const canvas = document.createElement('canvas');
  const width = radius * 2;
  canvas.width = width;
  canvas.height = width;
  const x = width / 2;
  const y = width / 2;
  const ctx = canvas.getContext('2d');
  // outer circle
  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.arc(x, y, radius, 0, FULL_CIRCLE);
  ctx.fill();
  // inner circle
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, radius - 1, 0, FULL_CIRCLE);
  ctx.fill();

  return new Promise(r => r(canvas));
}

export const getMemoizedStopIcon = memoize(
  getSmallStopIcon,
  (type, radius, color, isHilighted) =>
    `${type}_${radius}_${color}_${isHilighted}`,
);

/**
 * Draw stop icon based on type.
 * Determine size from zoom level.
 */

export function drawStopIcon(
  tile,
  geom,
  type,
  platformNumber,
  isHilighted,
  isFerryTerminal,
  modeIconColors,
) {
  // modeIconColors = modeIconColors || {};
  const mode = `mode-${type.toLowerCase()}`;
  const color =
    mode === 'mode-ferry' && !isFerryTerminal
      ? modeIconColors['mode-ferry-pier']
      : modeIconColors[mode];
  const zoom = tile.coords.z - 1;
  const drawNumber = zoom >= 16;
  const styles = getStopIconStyles('stop', zoom, isHilighted);
  if (!styles) {
    return;
  }
  const { style } = styles;
  let { width, height } = styles;
  width *= tile.scaleratio;
  height *= tile.scaleratio;

  const radius = width / 2;
  let x;
  let y;
  if (style === 'small') {
    x = geom.x / tile.ratio - radius;
    y = geom.y / tile.ratio - radius;
    getMemoizedStopIcon(
      isFerryTerminal ? 'FERRY_TERMINAL' : type,
      radius,
      color,
      isHilighted,
    ).then(image => {
      tile.ctx.drawImage(image, x, y);
    });
    return;
  }
  if (style === 'large') {
    x = geom.x / tile.ratio - width / 2;
    y = geom.y / tile.ratio - height;
    getImageFromSpriteCache(
      !isFerryTerminal
        ? `icon-icon_stop_${type.toLowerCase()}`
        : `icon-icon_${type.toLowerCase()}`,
      width,
      height,
      color,
    ).then(image => {
      tile.ctx.drawImage(image, x, y);
      if (drawNumber && platformNumber) {
        x += radius;
        y += radius;
        tile.ctx.beginPath();
        /* eslint-disable no-param-reassign */
        tile.ctx.fillStyle = color;
        tile.ctx.arc(x, y, radius - 1, 0, FULL_CIRCLE);
        tile.ctx.fill();
        tile.ctx.font = `${
          12 * tile.scaleratio
        }px Gotham XNarrow SSm A, Gotham XNarrow SSm B, Gotham Rounded A, Gotham Rounded B, Arial, sans-serif`;
        tile.ctx.fillStyle = '#fff';
        tile.ctx.textAlign = 'center';
        tile.ctx.textBaseline = 'middle';
        tile.ctx.fillText(platformNumber, x, y);
        /* eslint-enable no-param-reassign */
      }
    });

    if (isHilighted) {
      if (isFerryTerminal) {
        getImageFromSpriteCache(
          `icon-icon_station_highlight`,
          width,
          height,
        ).then(image => {
          tile.ctx.drawImage(
            image,
            x - 4 / tile.scaleratio,
            y - 4 / tile.scaleratio,
            width + 8 / tile.scaleratio,
            height + 8 / tile.scaleratio,
          );
        });
      } else {
        const selectedCircleOffset = getSelectedIconCircleOffset(
          zoom,
          tile.ratio,
        );
        tile.ctx.beginPath();
        // eslint-disable-next-line no-param-reassign
        tile.ctx.lineWidth = 2;
        tile.ctx.arc(
          x + selectedCircleOffset,
          y + selectedCircleOffset,
          radius + 2,
          0,
          FULL_CIRCLE,
        );
        tile.ctx.stroke();
      }
    }
  }
}
/**
 * Draw icon for hybrid stops, meaning BUS and TRAM stop in the same place.
 * Determine icon size based on zoom level
 */
export function drawHybridStopIcon(
  tile,
  geom,
  isHilighted,
  modeIconColors,
  hasTrunkRoute = false,
) {
  const zoom = tile.coords.z - 1;
  const styles = getStopIconStyles('hybrid', zoom, isHilighted);
  if (!styles) {
    return;
  }
  const { style } = styles;
  let { width, height } = styles;
  width *= tile.scaleratio;
  height *= tile.scaleratio;
  // only bus/tram hybrid exist
  if (style === 'small') {
    const radiusInner = 3;
    const radiusOuter = 5;
    const x = geom.x / tile.ratio;
    const y = geom.y / tile.ratio;
    // outer icon
    /* eslint-disable no-param-reassign */
    tile.ctx.beginPath();
    tile.ctx.fillStyle = '#fff';
    tile.ctx.arc(x, y, radiusOuter * tile.scaleratio, 0, FULL_CIRCLE);
    tile.ctx.fill();
    tile.ctx.beginPath();
    tile.ctx.fillStyle = modeIconColors['mode-tram'];
    tile.ctx.arc(x, y, (radiusOuter - 1) * tile.scaleratio, 0, FULL_CIRCLE);
    tile.ctx.fill();
    // inner icon
    tile.ctx.beginPath();
    tile.ctx.fillStyle = '#fff';
    tile.ctx.arc(x, y, radiusInner * tile.scaleratio, 0, FULL_CIRCLE);
    tile.ctx.fill();
    tile.ctx.beginPath();
    tile.ctx.fillStyle =
      modeIconColors[hasTrunkRoute ? 'mode-bus-express' : 'mode-bus'];
    tile.ctx.arc(x, y, (radiusInner - 0.5) * tile.scaleratio, 0, FULL_CIRCLE);
    tile.ctx.fill();
    /* eslint-enable no-param-reassign */
  }
  if (style === 'large') {
    const x = geom.x / tile.ratio - width / 2;
    const y = geom.y / tile.ratio - height;
    getImageFromSpriteCache(
      `icon-icon_map_hybrid_stop${hasTrunkRoute ? '_express' : ''}`,
      width,
      height,
    ).then(image => {
      tile.ctx.drawImage(image, x, y);
      if (isHilighted) {
        tile.ctx.beginPath();
        // eslint-disable-next-line no-param-reassign
        tile.ctx.lineWidth = 2;
        if (zoom === 14 || zoom === 13) {
          const xOff = 82; // Position in x-axis
          const yOff = 230; // Position in y-axis
          const radius = 11; // How large the arcs of the ellipse are (width of the ellipse)
          const eHeight = 65; // How tall the ellipse is. Smaller value => taller ellipse.
          tile.ctx.arc(
            x + xOff / tile.ratio,
            y + yOff / tile.ratio,
            radius * tile.scaleratio,
            0,
            Math.PI,
          );
          tile.ctx.arc(
            x + xOff / tile.ratio,
            y + eHeight / tile.ratio,
            radius * tile.scaleratio,
            Math.PI,
            0,
          );
          tile.ctx.arc(
            x + xOff / tile.ratio,
            y + yOff / tile.ratio,
            radius * tile.scaleratio,
            0,
            Math.PI,
          );
        } else if (zoom === 15) {
          tile.ctx.arc(
            x + 81 / tile.ratio,
            y + 213 / tile.ratio,
            12 * tile.scaleratio,
            0,
            Math.PI,
          );
          tile.ctx.arc(
            x + 81 / tile.ratio,
            y + 75 / tile.ratio,
            12 * tile.scaleratio,
            Math.PI,
            0,
          );
          tile.ctx.arc(
            x + 81 / tile.ratio,
            y + 213 / tile.ratio,
            12 * tile.scaleratio,
            0,
            Math.PI,
          );
        } else {
          tile.ctx.arc(
            x + 97.2 / tile.ratio,
            y + 273 / tile.ratio,
            13.5 * tile.scaleratio,
            0,
            Math.PI,
          );
          tile.ctx.arc(
            x + 97.2 / tile.ratio,
            y + 88.5 / tile.ratio,
            13.5 * tile.scaleratio,
            Math.PI,
            0,
          );
          tile.ctx.arc(
            x + 97.2 / tile.ratio,
            y + 273 / tile.ratio,
            13.5 * tile.scaleratio,
            0,
            Math.PI,
          );
        }
        tile.ctx.stroke();
      }
    });
  }
}

export const getMemoizedRentalStationIcon = memoize(
  getSmallStopIcon,
  (icon, width, height, bgColor, fgColor, badgeColor) =>
    `${icon}_${width}_${height}_${bgColor}_${fgColor}_${badgeColor}`,
);

/**
 * Draws small bike rental station icon. Color can vary.
 */
export function drawSmallCitybikeMarker(tile, geom, iconColor) {
  const radius = 5;
  const x = geom.x / tile.ratio - radius;
  const y = geom.y / tile.ratio - radius;
  getMemoizedStopIcon('CITYBIKE', radius, iconColor).then(image => {
    tile.ctx.drawImage(image, x, y);
  });
}

/**
 * Draw an icon for citybike stations, including indicator to show bike availability. Draw closed icon for closed stations
 * Determine icon size based on zoom level
 */
export function drawCitybikeIcon(
  tile,
  geom,
  operative,
  bikesAvailable,
  iconName,
  showAvailability,
  isHilighted,
  bgColor,
  fgColor,
) {
  const zoom = tile.coords.z - 1;
  const styles = getStopIconStyles('citybike', zoom, isHilighted);
  const { style } = styles;
  let { width, height } = styles;
  width *= tile.scaleratio;
  height *= tile.scaleratio;
  if (!styles) {
    return;
  }
  // stadtnavi/bbnavi should not show selectionCircle
  // const radius = width / 2;
  let x;
  let y;

  const cssVars = {
    operatorfg: fgColor,
    operatorbg: bgColor,
  };
  if (showAvailability) {
    if (!bikesAvailable || bikesAvailable < 1) {
      cssVars.badgecolor = '#DC0451';
    } else if (bikesAvailable <= 3) {
      cssVars.badgecolor = '#FBB800';
    } else {
      cssVars.badgecolor = '#008854';
    }
  } else {
    cssVars.badgecolor = 'none';
    cssVars.badgestroke = 'none';
  }

  if (style === 'medium') {
    x = geom.x / tile.ratio - width / 2;
    y = geom.y / tile.ratio - height;
    let icon = `${iconName}_station_small`;
    if (!operative) {
      icon = `${iconName}_station_closed_small`;
    }
    getImageFromSpriteCache(icon, width, height, undefined, cssVars).then(
      image => {
        tile.ctx.drawImage(image, x, y);
        // stadtnavi/bbnavi should not show selectionCircle
        // if (isHilighted) {
        //  drawSelectionCircle(tile, x, y, radius, false, false);
        // }
      },
    );
  }
  if (style === 'large') {
    const smallCircleRadius = 11 * tile.scaleratio;
    x = geom.x / tile.ratio - width + smallCircleRadius * 2;
    y = geom.y / tile.ratio - height;
    const showAvailabilityBadge =
      showAvailability &&
      Number.isSafeInteger(bikesAvailable) &&
      bikesAvailable > -1 &&
      operative;
    let icon = `${iconName}_station_large`;
    if (!operative) {
      icon = `${iconName}_station_closed_large`;
    }
    getImageFromSpriteCache(icon, width, height, undefined, cssVars)
      .then(image => {
        tile.ctx.drawImage(image, x, y);
        x = x + width - smallCircleRadius;
        y += smallCircleRadius;
        if (showAvailabilityBadge) {
          /* eslint-disable no-param-reassign */
          tile.ctx.font = `${
            10.8 * tile.scaleratio
          }px Gotham XNarrow SSm A, Gotham XNarrow SSm B, Gotham Rounded A, Gotham Rounded B, Arial, sans-serif`;
          tile.ctx.fillStyle =
            cssVars.badgecolor === '#FBB800' ? '#000' : '#fff'; // TODO better use brightness to switch
          tile.ctx.textAlign = 'center';
          tile.ctx.textBaseline = 'middle';
          tile.ctx.fillText(bikesAvailable, x, y);
          /* eslint-enable no-param-reassign */
        }
        // if (isHilighted) {
        //  drawSelectionCircle(tile, iconX, iconY, radius, true, true);
        // }
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(
          {
            icon,
            width,
            height,
            showAvailabilityBadge,
            isHilighted,
            bgColor,
            fgColor,
          },
          err,
        );
      });
  }
}

export function drawTerminalIcon(tile, geom, type, isHilighted) {
  const zoom = tile.coords.z - 1;
  const styles = getTerminalIconStyles(zoom);
  if (!styles) {
    return;
  }
  let { width, height } = styles;
  width *= tile.scaleratio;
  height *= tile.scaleratio;
  getImageFromSpriteCache(
    `icon-icon_${type.split(',')[0].toLowerCase()}`,
    width,
    height,
  ).then(image => {
    tile.ctx.drawImage(
      image,
      geom.x / tile.ratio - width / 2,
      geom.y / tile.ratio - height / 2,
    );
  });
  if (isHilighted) {
    getImageFromSpriteCache(`icon-icon_station_highlight`, width, height).then(
      image => {
        tile.ctx.drawImage(
          image,
          geom.x / tile.ratio - width / 2 - 4 / tile.scaleratio,
          geom.y / tile.ratio - height / 2 - 4 / tile.scaleratio,
          width + 8 / tile.scaleratio,
          height + 8 / tile.scaleratio,
        );
      },
    );
  }
}

/**
 * Draw icon for hybrid stations, meaning BUS and TRAM station in the same place.
 */
export function drawHybridStationIcon(tile, geom, isHilighted) {
  const zoom = tile.coords.z - 1;
  const styles = getTerminalIconStyles(zoom);
  if (!styles) {
    return;
  }
  let { width, height } = styles;
  width *= tile.scaleratio * 1.5;
  height *= tile.scaleratio * 1.5;
  // only bus/tram hybrid exist
  getImageFromSpriteCache('icon-icon_map_hybrid_station', width, height).then(
    image => {
      tile.ctx.drawImage(
        image,
        geom.x / tile.ratio - width / 2,
        geom.y / tile.ratio - height / 2,
      );
    },
  );
  if (isHilighted) {
    getImageFromSpriteCache(
      'icon-icon_hybrid_station_highlight',
      width,
      height,
    ).then(image => {
      tile.ctx.drawImage(
        image,
        geom.x / tile.ratio - width / 2 - 4 / tile.scaleratio,
        geom.y / tile.ratio - height / 2 - 4 / tile.scaleratio,
        width + 8 / tile.scaleratio,
        height + 8 / tile.scaleratio,
      );
    });
  }
}

/**
 * Draw icon for hybrid stations, meaning BUS and TRAM station in the same place.
 */
export function drawDatahubTileIcon(tile, geom, isHilighted, properties) {
  const zoom = tile.coords.z - 1;
  const styles = getTerminalIconStyles(zoom);
  if (!styles) {
    return;
  }
  let { width, height } = styles;
  width *= tile.scaleratio;
  height *= tile.scaleratio;

  const { svg_icon: svgIcon } = properties;
  const blobUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    svgIcon,
  )}`;
  const image = new Image(width, height);

  image.onload = function () {
    tile.ctx.drawImage(
      image,
      geom.x / tile.ratio - width / 2 - 1 / tile.scaleratio,
      geom.y / tile.ratio - height / 2 - height / tile.scaleratio,
      width + 2 / tile.scaleratio,
      height + 2 / tile.scaleratio,
    );
  };
  image.src = blobUrl;
}

export function drawParkAndRideIcon(
  type,
  tile,
  geom,
  width,
  height,
  isHilighted = false,
) {
  const img =
    type === ParkTypes.Bicycle ? 'icon-icon_bike-park' : 'icon-icon_car-park';
  getImageFromSpriteCache(img, width, height).then(image => {
    drawIconImage(image, tile, geom, width, height);
  });
  if (isHilighted) {
    getImageFromSpriteCache(`icon-icon_station_highlight`, width, height).then(
      image => {
        tile.ctx.drawImage(
          image,
          geom.x / tile.ratio - width / 2 - 4 / tile.scaleratio,
          geom.y / tile.ratio - height / 2 - 4 / tile.scaleratio,
          width + 7.5 / tile.scaleratio,
          height + 6 / tile.scaleratio,
        );
      },
    );
  }
}

export function drawAvailabilityBadge(
  availability,
  tile,
  geom,
  imageSize,
  badgeSize,
  scaleratio,
) {
  if (availability === null) {
    return;
  }

  if (
    availability !== 'good' &&
    availability !== 'poor' &&
    availability !== 'no'
  ) {
    throw Error("Supported badges are 'good', 'poor', and 'no'");
  }

  getImageFromSpriteCache(
    `icon-icon_${availability}-availability`,
    badgeSize,
    badgeSize,
  ).then(image => {
    drawIconImageBadge(image, tile, geom, imageSize, badgeSize, scaleratio);
  });
}

export function drawIcon(icon, tile, geom, imageSize) {
  return getImageFromSpriteCache(icon, imageSize, imageSize).then(image => {
    drawIconImage(image, tile, geom, imageSize, imageSize);
  });
}
