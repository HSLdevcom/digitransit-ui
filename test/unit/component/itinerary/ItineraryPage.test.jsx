/* eslint-disable react/prop-types */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { fetchQuery } from 'react-relay';
import ItineraryPage from '../../../../app/component/itinerary/ItineraryPage';
import TestProviders from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import { mockMatch, mockRouter } from '../../helpers/mock-router';
import { PLANTYPE } from '../../../../utils/client/planParamUtil';
import {
  quitIteration,
  stopClient,
} from '../../../../app/component/itinerary/ItineraryPageUtils';

vi.mock('react-relay', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    ...actual.default,
    // The shared setup replaces this hook before each test file runs.
    useFragment: (...args) => actual.default.useFragment(...args),
    fetchQuery: vi.fn(),
  };
});

vi.mock('../../../../utils/client/withBreakpoint', async importOriginal => ({
  ...(await importOriginal()),
  useBreakpoint: () => 'large',
}));

vi.mock('../../../../utils/client/planParamUtil', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    planQueryNeeded: (_config, _match, type, relaxed) =>
      !relaxed &&
      [actual.PLANTYPE.TRANSIT, actual.PLANTYPE.WALK].includes(type),
    getPlanParams: (_config, match, type) => ({
      destination: match.params.to,
      type,
      datetime: {},
      modes: { directOnly: type === actual.PLANTYPE.WALK },
      numItineraries: 5,
    }),
  };
});

vi.mock(
  '../../../../app/component/itinerary/ItineraryPageUtils',
  async importOriginal => ({
    ...(await importOriginal()),
    quitIteration: vi.fn(() => true),
    stopClient: vi.fn(),
    settingsLimitRouting: () => false,
  }),
);

vi.mock('../../../../app/component/DesktopView', () => ({
  default: ({ header, content }) => (
    <>
      {header}
      {content}
    </>
  ),
}));
vi.mock('../../../../app/component/map/ItineraryPageMap', () => ({
  default: () => null,
}));
vi.mock('../../../../app/component/itinerary/ItineraryPageControls', () => ({
  default: () => null,
}));
vi.mock('../../../../app/component/itinerary/AlternativeItineraryBar', () => ({
  default: ({ walkPlan }) => (
    <div data-testid="walking">{walkPlan?.edges?.[0]?.node.id}</div>
  ),
}));
vi.mock('../../../../app/component/itinerary/ItineraryListContainer', () => ({
  default: ({ planEdges, onEarlier, onLater }) => (
    <>
      <div data-testid="itineraries">
        {planEdges.map(edge => edge.node.id).join(',')}
      </div>
      <button type="button" onClick={onEarlier}>
        Earlier
      </button>
      <button type="button" onClick={onLater}>
        Later
      </button>
    </>
  ),
}));

const config = createTestConfig({
  showVehiclesOnItineraryPage: false,
  showWeatherInformation: false,
});

function page(destination) {
  const from = 'Kotka::60.4667,26.9458';
  const to = `${destination}::60.5697,27.1979`;
  const match = {
    ...mockMatch,
    params: { from, to },
    location: {
      ...mockMatch.location,
      pathname: `/reitti/${from}/${to}`,
      query: { time: '1792400000' },
    },
  };
  return (
    <TestProviders config={config} match={match} router={mockRouter}>
      <ItineraryPage />
    </TestProviders>
  );
}

function plan(id) {
  return {
    edges: [
      {
        node: {
          id,
          start: '2026-10-19T10:00:00Z',
          end: '2026-10-19T11:00:00Z',
          legs: [
            {
              mode: 'BUS',
              from: {},
              to: {},
              legGeometry: { points: '' },
            },
          ],
        },
      },
    ],
    pageInfo: { startCursor: 'earlier', endCursor: 'later' },
  };
}

describe('ItineraryPage lifecycle', () => {
  let requests;

  beforeEach(() => {
    requests = [];
    stopClient.mockClear();
    quitIteration.mockReturnValue(true);
    fetchQuery.mockImplementation((_environment, _query, variables) => ({
      toPromise: () =>
        new Promise((resolve, reject) => {
          requests.push({ variables, resolve, reject });
        }),
    }));
  });

  async function finishSearch(destination) {
    await act(async () => {
      requests
        .filter(request =>
          request.variables.destination.startsWith(destination),
        )
        .forEach(request => {
          request.resolve({
            plan: plan(`${destination}-${request.variables.type}`),
          });
        });
    });
  }

  it('stops MQTT on unmount even when itinerary vehicle display is disabled', () => {
    const { unmount } = render(page('Savukoski'));

    expect(stopClient).not.toHaveBeenCalled();
    unmount();

    expect(stopClient).toHaveBeenCalledTimes(1);
  });

  it('keeps the latest main and alternative plans when older results arrive', async () => {
    const { rerender } = render(page('Savukoski'));
    rerender(page('Hamina'));
    await finishSearch('Hamina');

    expect(screen.getByTestId('itineraries').textContent).toBe(
      `Hamina-${PLANTYPE.TRANSIT}`,
    );
    expect(screen.getByTestId('walking').textContent).toBe(
      `Hamina-${PLANTYPE.WALK}`,
    );

    quitIteration.mockReturnValue(false);
    await finishSearch('Savukoski');

    expect(requests).toHaveLength(4);
    expect(screen.getByTestId('itineraries').textContent).toBe(
      `Hamina-${PLANTYPE.TRANSIT}`,
    );
    expect(screen.getByTestId('walking').textContent).toBe(
      `Hamina-${PLANTYPE.WALK}`,
    );
  });

  it('ignores errors from an older search without clearing the latest results', async () => {
    const { rerender } = render(page('Savukoski'));
    rerender(page('Hamina'));
    await finishSearch('Hamina');
    await act(async () => {
      requests
        .filter(request =>
          request.variables.destination.startsWith('Savukoski'),
        )
        .forEach(request => request.reject(new Error('Old search failed')));
    });

    expect(screen.getByTestId('itineraries').textContent).toBe(
      `Hamina-${PLANTYPE.TRANSIT}`,
    );
    expect(screen.getByTestId('walking').textContent).toBe(
      `Hamina-${PLANTYPE.WALK}`,
    );
  });

  it('keeps loading the new search when the old search finishes first', async () => {
    const { rerender } = render(page('Savukoski'));
    rerender(page('Hamina'));
    await finishSearch('Savukoski');

    expect(screen.queryByTestId('itineraries')).toBeNull();
    await finishSearch('Hamina');
    expect(screen.getByTestId('itineraries').textContent).toBe(
      `Hamina-${PLANTYPE.TRANSIT}`,
    );
  });

  it('does not continue query iterations after unmounting', async () => {
    const { unmount } = render(page('Savukoski'));
    unmount();
    quitIteration.mockReturnValue(false);
    await finishSearch('Savukoski');

    expect(requests).toHaveLength(2);
  });

  it.each(['Earlier', 'Later'])(
    'ignores an old %s request after the destination changes',
    async button => {
      const { rerender } = render(page('Savukoski'));
      await finishSearch('Savukoski');
      fireEvent.click(screen.getByRole('button', { name: button }));
      const pagination = requests[requests.length - 1];

      rerender(page('Hamina'));
      await finishSearch('Hamina');
      await act(async () => {
        pagination.resolve({ plan: plan('Old pagination') });
      });

      expect(screen.getByTestId('itineraries').textContent).toBe(
        `Hamina-${PLANTYPE.TRANSIT}`,
      );
    },
  );
});
