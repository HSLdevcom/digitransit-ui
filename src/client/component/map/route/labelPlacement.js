// Size estimates match RouteLineLabel.module.scss (11px font, 3px/--space-xs padding)
const LABEL_HEIGHT = 19;
const CHAR_WIDTH = 5.6;
const LETTER_SPACING = -0.3;
const HORIZONTAL_PADDING = 16;
const TAIL_REACH = 18; // from the bubble edge to the tail tip
export const MARKER_REACH = 10; // keeps the tip off a marker's centre
const LINE_CLEARANCE = 5;
const SHIFT = 16;
export const PIN_LIFT = -8; // lift of the pin label, also passed to the stylesheet
const MAX_TAIL_ANGLE = 30; // degrees
const MAX_TAIL_SHIFT = 5; // tail base offset towards the bubble edge nearer the anchor
const SHIFTS = [0, -SHIFT, SHIFT, -2 * SHIFT, 2 * SHIFT, -3 * SHIFT, 3 * SHIFT];
const MAX_SHIFT = 3 * SHIFT;
const SIDE_ORDER = { right: ['right', 'left'], pin: ['right', 'left'], left: ['left', 'right'] };

let measureContext;

/** Text width in pixels, measured with canvas when available, else estimated */
function textWidth(text) {
  if (measureContext === undefined) {
    try {
      measureContext = document.createElement('canvas').getContext('2d') || null;
    } catch (e) {
      measureContext = null;
    }
    if (measureContext) {
      measureContext.font = '350 11px sans-serif';
    }
  }
  const measured = measureContext?.measureText(text).width;
  return measured ? measured + text.length * LETTER_SPACING : text.length * CHAR_WIDTH;
}

const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

function rectsOverlap(a, b) {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

/** Whether segment a-b crosses the rectangle (Liang-Barsky clipping) */
function segmentHitsRect(a, b, rect) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const clip = (p, q) => {
    if (p === 0) {
      return q >= 0;
    }
    const t = q / p;
    if (p < 0) {
      t0 = Math.max(t0, t);
    } else {
      t1 = Math.min(t1, t);
    }
    return true;
  };
  return (
    clip(-dx, a.x - rect.x0) &&
    clip(dx, rect.x1 - a.x) &&
    clip(-dy, a.y - rect.y0) &&
    clip(dy, rect.y1 - a.y) &&
    t0 <= t1
  );
}

/** Segments ([a, b] point pairs) whose bounding box touches the area */
function segmentsNear(linePoints, area) {
  const near = [];
  for (let i = 1; i < linePoints.length; i++) {
    const a = linePoints[i - 1];
    const b = linePoints[i];
    if (
      Math.max(a.x, b.x) >= area.x0 &&
      Math.min(a.x, b.x) <= area.x1 &&
      Math.max(a.y, b.y) >= area.y0 &&
      Math.min(a.y, b.y) <= area.y1
    ) {
      near.push([a, b]);
    }
  }
  return near;
}

const countHits = (segments, rect) =>
  segments.filter(([a, b]) => segmentHitsRect(a, b, rect)).length;

/**
 * Chooses the side and vertical shift of a label so that it does not cover the line.
 * @param {{x:number,y:number}} anchor anchor in pixels
 * @param {Array<{x:number,y:number}>|Array<Array<{x:number,y:number}>>} linePoints route geometry
 *   in pixels, or several separate lines
 * @param {string} text label text
 * @param {'right'|'left'|'pin'} preferred preferred placement
 * @param {Array} occupied pixel rectangles of the labels already placed
 * @returns {{placement: string, dy: number, tailDy: number, tailAngle: number, rect: object}}
 */
export default function chooseLabelPlacement(anchor, linePoints, text, preferred, occupied = []) {
  const width = textWidth(text) + HORIZONTAL_PADDING;
  const baseY = preferred === 'pin' ? PIN_LIFT : 0;

  const rectFor = (side, dy) => {
    const cy = anchor.y + baseY + dy;
    const x0 =
      side === 'right' ? anchor.x + MARKER_REACH + TAIL_REACH : anchor.x - TAIL_REACH - width;
    return {
      x0: x0 - LINE_CLEARANCE,
      x1: x0 + width + LINE_CLEARANCE,
      y0: cy - LABEL_HEIGHT / 2 - LINE_CLEARANCE,
      y1: cy + LABEL_HEIGHT / 2 + LINE_CLEARANCE,
    };
  };
  // all candidate rects lie within this area, so scan only the nearby line segments
  const reachX = MARKER_REACH + TAIL_REACH + width + LINE_CLEARANCE;
  const reachY = MAX_SHIFT + LABEL_HEIGHT / 2 + LINE_CLEARANCE;
  const lines = Array.isArray(linePoints[0]) ? linePoints : [linePoints];
  const area = {
    x0: anchor.x - reachX,
    x1: anchor.x + reachX,
    y0: anchor.y + baseY - reachY,
    y1: anchor.y + baseY + reachY,
  };
  const nearby = lines.flatMap(line => segmentsNear(line, area));
  // number of labels and line segments that the rect would cover
  const clashes = rect =>
    occupied.filter(other => rectsOverlap(rect, other)).length * 100 + countHits(nearby, rect);

  const sides = SIDE_ORDER[preferred];
  const candidates = SHIFTS.flatMap(dy =>
    sides.map(side => ({ side, dy, rect: rectFor(side, dy) })),
  );
  // the first free spot wins; if there is none, the one with the least clashes
  let found = candidates[0];
  let fewest = Infinity;
  candidates.some(candidate => {
    const count = clashes(candidate.rect);
    if (count < fewest) {
      found = candidate;
      fewest = count;
    }
    return count === 0;
  });

  let placement = 'left';
  if (found.side === 'right') {
    placement = preferred === 'pin' ? 'pin' : 'right';
  }
  // Move the tail base towards the anchor's side of the bubble and tilt it at the anchor
  const toAnchor = -(baseY + found.dy);
  const tailDy = clamp(toAnchor, MAX_TAIL_SHIFT);
  const angle =
    ((Math.atan2(toAnchor - tailDy, TAIL_REACH) * 180) / Math.PI) *
    (found.side === 'right' ? -1 : 1);
  return {
    placement,
    dy: found.dy,
    rect: found.rect,
    tailDy,
    tailAngle: clamp(angle, MAX_TAIL_ANGLE),
  };
}
