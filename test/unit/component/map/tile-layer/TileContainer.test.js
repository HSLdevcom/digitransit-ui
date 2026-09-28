import TileContainer from '../../../../../app/component/map/tile-layer/TileContainer';

describe('TileContainer', () => {
  const config = {
    stopsMinZoom: 13,
    terminalStopsMinZoom: 13,
    vehicleRental: { cityBikeMinZoom: 16 },
  };

  // A feature placed so that the click point below always lands on it.
  const clickPoint = [50, 50];
  const feature = {
    geom: { x: 800, y: 800 }, // (x, y) / ratio(16) === clickPoint
    properties: { stops: true }, // skip icon-style-based hitbox adjustment
  };
  const mockLayer = {
    features: [feature],
    constructor: { getName: () => 'stop' },
  };

  function createTileContainer(props) {
    return new TileContainer(
      { x: 1, y: 2, z: 15 },
      () => {},
      { tileSize: 256, layers: [], mapLayers: {}, ...props },
      config,
      false,
      undefined,
      [''],
      [],
      undefined,
      undefined,
      'en',
    );
  }

  it('selects the nearest map icon on click by default', () => {
    const tile = createTileContainer({});
    tile.layers = [mockLayer];
    tile.onSelectableTargetClicked = vi.fn();

    tile.onMapClick({ type: 'click', latlng: {} }, clickPoint);

    expect(tile.onSelectableTargetClicked).toHaveBeenCalledTimes(1);
    expect(tile.onSelectableTargetClicked.mock.calls[0][0]).toHaveLength(1);
  });

  it('ignores map icons on click when disableIconClick is set', () => {
    vi.useFakeTimers();
    const tile = createTileContainer({ disableIconClick: true });
    tile.layers = [mockLayer];
    tile.onSelectableTargetClicked = vi.fn();

    tile.onMapClick({ type: 'click', latlng: {} }, clickPoint);
    vi.advanceTimersByTime(300);

    expect(tile.onSelectableTargetClicked).toHaveBeenCalledTimes(1);
    expect(tile.onSelectableTargetClicked).toHaveBeenCalledWith([], {});
    vi.useRealTimers();
  });

  it('ignores map icons on right-click when disableIconClick is set', () => {
    const tile = createTileContainer({ disableIconClick: true });
    tile.layers = [mockLayer];
    tile.onSelectableTargetClicked = vi.fn();

    tile.onMapClick({ type: 'contextmenu', latlng: {} }, clickPoint);

    expect(tile.onSelectableTargetClicked).toHaveBeenCalledWith([], {});
  });
});
