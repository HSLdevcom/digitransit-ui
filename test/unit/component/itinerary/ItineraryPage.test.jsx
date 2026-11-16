/* eslint-disable react/prop-types */
import { act, fireEvent, render, screen } from '@testing-library/react';
import * as relay from 'react-relay';
import ItineraryPage from '../../../../app/component/itinerary/ItineraryPage';
import TestProviders from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import { mockMatch, mockRouter } from '../../helpers/mock-router';
import * as planParamUtil from '../../../../utils/client/planParamUtil';
import * as ItineraryPageUtils from '../../../../app/component/itinerary/ItineraryPageUtils';
import * as DesktopViewModule from '../../../../app/component/DesktopView';
import * as ItineraryPageMapModule from '../../../../app/component/map/ItineraryPageMap';
import * as ItineraryPageControlsModule from '../../../../app/component/itinerary/ItineraryPageControls';
import * as AlternativeItineraryBarModule from '../../../../app/component/itinerary/AlternativeItineraryBar';
import * as ItineraryListContainerModule from '../../../../app/component/itinerary/ItineraryListContainer';

const { PLANTYPE } = planParamUtil;

const DesktopViewStub = ({ header, content }) => (
  <>
    {header}
    {content}
  </>
);
const EmptyStub = () => null;
const AlternativeItineraryBarStub = ({ walkPlan }) => (
  <div data-testid="walking">{walkPlan?.edges?.[0]?.node.id}</div>
);
const ItineraryListContainerStub = ({ planEdges, onEarlier, onLater }) => (
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
);

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
  let quitIteration;
  let stopClient;

  beforeEach(() => {
    requests = [];
    vi.spyOn(planParamUtil, 'planQueryNeeded').mockImplementation(
      (_config, _match, type, relaxed) =>
        !relaxed && [PLANTYPE.TRANSIT, PLANTYPE.WALK].includes(type),
    );
    vi.spyOn(planParamUtil, 'getPlanParams').mockImplementation(
      (_config, match, type) => ({
        destination: match.params.to,
        type,
        datetime: {},
        modes: { directOnly: type === PLANTYPE.WALK },
        numItineraries: 5,
      }),
    );
    quitIteration = vi
      .spyOn(ItineraryPageUtils, 'quitIteration')
      .mockReturnValue(true);
    stopClient = vi
      .spyOn(ItineraryPageUtils, 'stopClient')
      .mockImplementation(() => {});
    vi.spyOn(ItineraryPageUtils, 'settingsLimitRouting').mockReturnValue(false);
    vi.spyOn(DesktopViewModule, 'default', 'get').mockReturnValue(
      DesktopViewStub,
    );
    vi.spyOn(ItineraryPageMapModule, 'default', 'get').mockReturnValue(
      EmptyStub,
    );
    vi.spyOn(ItineraryPageControlsModule, 'default', 'get').mockReturnValue(
      EmptyStub,
    );
    vi.spyOn(AlternativeItineraryBarModule, 'default', 'get').mockReturnValue(
      AlternativeItineraryBarStub,
    );
    vi.spyOn(ItineraryListContainerModule, 'default', 'get').mockReturnValue(
      ItineraryListContainerStub,
    );
    vi.spyOn(relay, 'fetchQuery').mockImplementation(
      (_environment, _query, variables) => ({
        subscribe: sink => {
          const request = { variables, cancelled: false };
          request.resolve = data => {
            if (!request.cancelled) {
              sink.next(data);
              sink.complete();
            }
          };
          request.reject = error => {
            if (!request.cancelled) {
              sink.error(error);
            }
          };
          requests.push(request);
          sink.start({
            unsubscribe: () => {
              request.cancelled = true;
            },
          });
        },
      }),
    );
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

  it('cancels pending requests of the old search when the search changes', async () => {
    const { rerender } = render(page('Savukoski'));
    rerender(page('Hamina'));

    const isOld = request =>
      request.variables.destination.startsWith('Savukoski');
    expect(requests.filter(isOld)).toHaveLength(2);
    expect(requests.filter(isOld).every(r => r.cancelled)).toBe(true);
    expect(requests.filter(r => !isOld(r)).some(r => r.cancelled)).toBe(false);
  });

  it('does not cancel requests that have already finished', async () => {
    const { rerender } = render(page('Savukoski'));
    await finishSearch('Savukoski');
    rerender(page('Hamina'));

    expect(requests.some(r => r.cancelled)).toBe(false);
  });

  it('cancels pending requests on unmount', () => {
    const { unmount } = render(page('Savukoski'));
    unmount();

    expect(requests.every(r => r.cancelled)).toBe(true);
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
