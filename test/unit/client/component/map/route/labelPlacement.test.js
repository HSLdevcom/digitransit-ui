import chooseLabelPlacement from '../../../../../../src/client/component/map/route/labelPlacement';

describe('chooseLabelPlacement', () => {
  const anchor = { x: 0, y: 0 };

  it('keeps the preferred side when the line is clear', () => {
    const line = [
      { x: 0, y: -100 },
      { x: 0, y: 100 },
    ];
    expect(chooseLabelPlacement(anchor, line, 'Label', 'left')).toMatchObject({
      placement: 'left',
      dy: 0,
    });
  });

  it('switches side when the line runs through the preferred side', () => {
    const line = [
      { x: -200, y: 0 },
      { x: 0, y: 0 },
    ];
    expect(chooseLabelPlacement(anchor, line, 'Label', 'left')).toMatchObject({
      placement: 'right',
      dy: 0,
    });
  });

  it('shifts the label off a line that runs through both sides', () => {
    const line = [
      { x: -300, y: 0 },
      { x: 300, y: 0 },
    ];
    expect(chooseLabelPlacement(anchor, line, 'Label', 'left').dy).not.toBe(0);
  });
});

describe('chooseLabelPlacement with occupied space', () => {
  it('avoids labels that are already placed', () => {
    const first = chooseLabelPlacement({ x: 0, y: 0 }, [], 'Label', 'right');
    const second = chooseLabelPlacement({ x: 0, y: 0 }, [], 'Label', 'right', [first.rect]);
    expect(second.rect.x0 < first.rect.x1 && first.rect.x0 < second.rect.x1).toBe(false);
  });
});

describe('chooseLabelPlacement when nothing is free', () => {
  it('falls back to the preferred spot', () => {
    const wall = [
      { x: -300, y: -300 },
      { x: -300, y: 300 },
    ];
    const blocked = Array.from({ length: 1 }, () => ({ x0: -400, x1: 400, y0: -400, y1: 400 }));
    const result = chooseLabelPlacement({ x: 0, y: 0 }, wall, 'Label', 'right', blocked);
    expect(result).toMatchObject({ placement: 'right', dy: 0 });
  });
});
