import { useState } from 'react';
import PropTypes from 'prop-types';
import { fireEvent, screen } from '@testing-library/react';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import SearchAutosuggest, {
  SearchAutosuggestPanel,
} from '../../../app/component/SearchAutosuggest';
import SelectFromMap from '../../../app/component/map/SelectFromMap';
import SelectFromMapModal from '../../../app/component/SelectFromMapModal';
import searchContext from '../../../app/data/SearchContext';
import { addAnalyticsEvent } from '../../../utils/shared/analyticsUtils';
import { SEARCH_PATH_OPTS } from '../../../utils/client/searchUtils';
import { createTestIntl, renderWithProviders } from '../helpers/mock-providers';

vi.mock('@digitransit-component/digitransit-component-autosuggest', () => ({
  default: vi.fn(),
}));
vi.mock(
  '@digitransit-component/digitransit-component-autosuggest-panel',
  () => ({
    default: vi.fn(),
  }),
);
vi.mock('../../../app/component/map/SelectFromMap', () => ({
  default: vi.fn(),
}));
vi.mock('../../../app/component/SelectFromMapModal', () => ({
  default: vi.fn(),
}));

const mapLocation = { address: 'Map location', lat: 60.2, lon: 24.9 };
const manualSuggestion = {
  type: 'Point',
  properties: { name: 'Manual location', label: 'Manual location' },
  geometry: { coordinates: [24.9, 60.2] },
};

function AutosuggestStub({
  onSelect,
  handleViaPointLocationSelected,
  id = 'origin',
  inputLabel = 'search text',
}) {
  const [text, setText] = useState('');
  return (
    <>
      <input
        aria-label={inputLabel}
        value={text}
        onChange={event => setText(event.target.value)}
      />
      <button
        type="button"
        onClick={() => onSelect({ type: 'SelectFromMap' }, id)}
      >
        map {inputLabel}
      </button>
      <button type="button" onClick={() => onSelect(manualSuggestion, id)}>
        select {inputLabel}
      </button>
      {handleViaPointLocationSelected && (
        <button
          type="button"
          onClick={() => handleViaPointLocationSelected(manualSuggestion, 0)}
        >
          select via point
        </button>
      )}
    </>
  );
}

AutosuggestStub.propTypes = {
  onSelect: PropTypes.func.isRequired,
  handleViaPointLocationSelected: PropTypes.func,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  inputLabel: PropTypes.string,
};

function MapStub({ type, onConfirm }) {
  return (
    <button type="button" onClick={() => onConfirm(type, mapLocation)}>
      confirm map
    </button>
  );
}

MapStub.propTypes = {
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onConfirm: PropTypes.func.isRequired,
};

function ModalStub({ title, children, onClose }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title}>
      {children}
      <button type="button" onClick={onClose}>
        cancel map
      </button>
    </div>
  );
}

ModalStub.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

describe('search autosuggest adapters', () => {
  beforeEach(() => {
    DTAutoSuggest.mockReset().mockImplementation(AutosuggestStub);
    DTAutosuggestPanel.mockReset().mockImplementation(AutosuggestStub);
    SelectFromMap.mockReset().mockImplementation(MapStub);
    SelectFromMapModal.mockReset().mockImplementation(ModalStub);
  });

  it.each([
    ['autosuggest', SearchAutosuggest, DTAutoSuggest],
    ['panel', SearchAutosuggestPanel, DTAutosuggestPanel],
  ])('wires the %s selection contract', (_name, Component, input) => {
    const selectHandler = vi.fn();
    const onGeolocationStart = vi.fn();
    renderWithProviders(
      <Component
        selectHandler={selectHandler}
        onGeolocationStart={onGeolocationStart}
        handleViaPointLocationSelected={vi.fn()}
        showViapointControl
      />,
    );

    const props = input.mock.lastCall[0];
    expect(props).toEqual(
      expect.objectContaining({
        appElement: '#app',
        searchContext,
        addAnalyticsEvent,
        selectHandler,
        onGeolocationStart,
        locationState: expect.objectContaining({ status: 'no-location' }),
        isMobile: false,
        showViapointControl: true,
        pathOpts: SEARCH_PATH_OPTS,
        onSelect: expect.any(Function),
        handleViaPointLocationSelected: props.onSelect,
      }),
    );
    fireEvent.click(screen.getByText('select search text'));
    expect(selectHandler).toHaveBeenCalledWith(
      expect.objectContaining({ address: 'Manual location' }),
      'origin',
    );
    fireEvent.click(screen.getByText('select via point'));
    expect(selectHandler).toHaveBeenLastCalledWith(
      expect.objectContaining({ address: 'Manual location' }),
      0,
    );
  });

  it('preserves caller overrides and conditional via-point handling', () => {
    const onSelect = vi.fn();
    const analytics = vi.fn();
    const viaHandler = vi.fn();
    const customPathOpts = { stopsPrefix: 'custom' };
    const locationState = { lat: 61, lon: 25 };
    renderWithProviders(
      <SearchAutosuggest
        selectHandler={vi.fn()}
        appElement="#custom"
        onSelect={onSelect}
        addAnalyticsEvent={analytics}
        handleViaPointLocationSelected={viaHandler}
        pathOpts={customPathOpts}
        locationState={locationState}
      />,
    );

    expect(DTAutoSuggest.mock.lastCall[0]).toEqual(
      expect.objectContaining({
        appElement: '#custom',
        onSelect,
        addAnalyticsEvent: analytics,
        handleViaPointLocationSelected: viaHandler,
        locationState,
        pathOpts: SEARCH_PATH_OPTS,
      }),
    );
    fireEvent.click(screen.getByText('select search text'));
    expect(onSelect).toHaveBeenCalledWith(manualSuggestion, 'origin');
  });

  it('unmounts the input during map selection and calls the close callback only on cancellation', () => {
    const selectHandler = vi.fn();
    const onFromMapClose = vi.fn();
    renderWithProviders(
      <SearchAutosuggest
        selectHandler={selectHandler}
        onFromMapClose={onFromMapClose}
      />,
    );
    fireEvent.change(screen.getByLabelText('search text'), {
      target: { value: 'draft' },
    });
    fireEvent.click(screen.getByText('map search text'));
    expect(screen.queryByLabelText('search text')).toBeNull();
    expect(selectHandler).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('cancel map'));
    expect(onFromMapClose).toHaveBeenCalledTimes(1);
    expect(selectHandler).not.toHaveBeenCalled();
    expect(screen.getByLabelText('search text').value).toBe('');

    fireEvent.click(screen.getByText('map search text'));
    fireEvent.click(screen.getByText('confirm map'));
    expect(selectHandler).toHaveBeenCalledWith(mapLocation, 'origin');
    expect(onFromMapClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByLabelText('search text').value).toBe('');
  });

  it.each([
    ['origin', 'select-from-map-origin'],
    ['destination', 'select-from-map-destination'],
    ['favourite', 'select-from-map-favourite'],
    [0, 'select-from-map-viaPoint'],
  ])('supports initial map selection for %s', (id, titleId) => {
    const selectHandler = vi.fn();
    const onFromMapClose = vi.fn();
    renderWithProviders(
      <SearchAutosuggest
        selectHandler={selectHandler}
        onFromMapClose={onFromMapClose}
        fromMap={id}
      />,
    );

    expect(
      screen.getByRole('dialog', {
        name: createTestIntl().formatMessage({ id: titleId }),
      }),
    ).not.toBeNull();
    expect(screen.queryByLabelText('search text')).toBeNull();
    fireEvent.click(screen.getByText('confirm map'));
    expect(selectHandler).toHaveBeenCalledWith(mapLocation, id);
    expect(onFromMapClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText('search text')).not.toBeNull();
    expect(DTAutoSuggest.mock.lastCall[0].fromMap).toBe(id);
  });

  it('keeps map selections isolated between searches with the same field ID', () => {
    const firstSelectHandler = vi.fn();
    const secondSelectHandler = vi.fn();
    renderWithProviders(
      <>
        <SearchAutosuggest
          inputLabel="first search"
          selectHandler={firstSelectHandler}
        />
        <SearchAutosuggest
          inputLabel="second search"
          selectHandler={secondSelectHandler}
        />
      </>,
    );

    fireEvent.click(screen.getByText('map first search'));
    expect(screen.queryByLabelText('first search')).toBeNull();
    expect(screen.getByLabelText('second search')).not.toBeNull();
    fireEvent.click(screen.getByText('select second search'));
    expect(secondSelectHandler).toHaveBeenCalledWith(
      expect.objectContaining({ address: 'Manual location' }),
      'origin',
    );
    expect(firstSelectHandler).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('confirm map'));
    expect(firstSelectHandler).toHaveBeenCalledWith(mapLocation, 'origin');
    expect(secondSelectHandler).toHaveBeenCalledTimes(1);
  });
});
