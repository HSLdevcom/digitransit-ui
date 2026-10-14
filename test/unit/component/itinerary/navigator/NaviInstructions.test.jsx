import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import NaviInstructions from '../../../../../app/component/itinerary/navigator/NaviInstructions';
import { LEGTYPE } from '../../../../../app/component/itinerary/navigator/NaviUtils';
import { config, tram2, tram3, interlineTime } from './fixtures/interlineLegs';

const baseConfig = createTestConfig();

describe('<NaviInstructions />', () => {
  it('shows the destination and tail distance for a MOVE leg', () => {
    const { container } = renderWithProviders(
      <NaviInstructions
        leg={{ to: {}, mode: 'WALK' }}
        nextLeg={null}
        instructions="navileg-walk"
        legType={LEGTYPE.MOVE}
        time={0}
        tailLength={150}
        showDestinationInfo
      />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('Walk to');
  });

  it('formats the tail distance in kilometers when config.alwaysShowDistanceInKm is set', () => {
    const { container } = renderWithProviders(
      <NaviInstructions
        leg={{ to: {}, mode: 'WALK' }}
        nextLeg={null}
        instructions="navileg-walk"
        legType={LEGTYPE.MOVE}
        time={0}
        tailLength={150}
        showDestinationInfo
      />,
      { config: createTestConfig({ alwaysShowDistanceInKm: true }) },
    );
    expect(container.textContent).toContain('0.1  km');
  });

  it('hides the destination row when showDestinationInfo is false', () => {
    const { container } = renderWithProviders(
      <NaviInstructions
        leg={{ to: {}, mode: 'WALK' }}
        nextLeg={null}
        instructions="navileg-walk"
        legType={LEGTYPE.MOVE}
        time={0}
        tailLength={150}
      />,
      { config: baseConfig },
    );
    expect(container.querySelector('.navi-header-chain')).toBeNull();
  });

  it('renders nothing for an unrecognized legType', () => {
    const { container } = renderWithProviders(
      <NaviInstructions
        instructions="navileg-walk"
        legType={LEGTYPE.PENDING}
        time={0}
        tailLength={150}
      />,
      { config: baseConfig },
    );
    expect(container.textContent).toBe('');
  });
});

const baseProps = {
  instructions: 'navileg-in-transit',
  legType: LEGTYPE.TRANSIT,
  time: interlineTime,
  tailLength: 0,
  leg: tram2,
};

function renderTransitCard(nextLeg) {
  return renderWithProviders(
    <NaviInstructions {...baseProps} nextLeg={nextLeg} />,
    { config },
  );
}

describe('<NaviInstructions /> interline messaging', () => {
  it('mentions the route number changing when the interlined route differs', () => {
    const { container } = renderTransitCard(tram3);
    expect(container.textContent).toContain('route number');
  });

  it('only mentions the destination changing when the interlined route stays the same', () => {
    const sameRouteNext = { ...tram3, route: tram2.route };
    const { container } = renderTransitCard(sameRouteNext);
    expect(container.textContent).not.toContain('route number');
    expect(container.textContent).toContain('destination');
  });

  it('falls back to the normal "leave at" message for a non-interlined next leg', () => {
    const normalNext = { ...tram3, interlineWithPreviousLeg: false };
    const { container } = renderTransitCard(normalNext);
    expect(container.textContent).toContain('Get off at');
  });
});

describe('<NaviInstructions /> TRANSIT destination wording', () => {
  function renderCard(leg) {
    return renderWithProviders(
      <NaviInstructions
        instructions="navileg-in-transit"
        legType={LEGTYPE.TRANSIT}
        time={interlineTime}
        tailLength={0}
        leg={leg}
      />,
      { config },
    );
  }

  it('calls a ferry destination a "ferry pier"', () => {
    const ferryLeg = {
      ...tram2,
      mode: 'FERRY',
      route: { shortName: 'F1', mode: 'FERRY' },
      to: { stop: { name: 'Suomenlinna', parentStation: null } },
    };
    const { container } = renderCard(ferryLeg);
    expect(container.textContent).toContain('ferry pier');
  });

  it('calls a stop with a parent station a "station"', () => {
    const railLeg = {
      ...tram2,
      mode: 'RAIL',
      route: { shortName: 'I', mode: 'RAIL' },
      to: { stop: { name: 'Pasila', parentStation: { id: 'HSL:1000202' } } },
    };
    const { container } = renderCard(railLeg);
    expect(container.textContent).toContain('station');
  });
});

describe('<NaviInstructions /> MOVE / WAIT / WAIT_IN_VEHICLE leg types', () => {
  const at = ms => ({
    scheduledTime: new Date(ms).toISOString(),
    estimated: { time: new Date(ms).toISOString(), delay: 0 },
  });

  const walkLeg = { mode: 'WALK', transitLeg: false, to: {} };
  const busNextLeg = {
    mode: 'BUS',
    transitLeg: true,
    route: { shortName: '55', mode: 'BUS' },
    trip: { tripHeadsign: 'Downtown' },
    start: at(interlineTime + 3 * 60000),
  };

  function renderCard(props) {
    return renderWithProviders(
      <NaviInstructions
        instructions="navileg-walk"
        time={interlineTime}
        tailLength={120}
        {...props}
      />,
      { config },
    );
  }

  it('shows the walk destination and a compact boarding hint when the next leg boards transit', () => {
    const { container } = renderCard({
      legType: LEGTYPE.MOVE,
      leg: walkLeg,
      nextLeg: busNextLeg,
      showDestinationInfo: true,
    });
    expect(container.textContent).toContain('Walk to');
    expect(container.textContent).toContain('and board');
    expect(container.querySelector('.compact-boarding')).not.toBeNull();
    expect(container.textContent).toContain('3 min');
  });

  it('omits the destination header for a MOVE leg when showDestinationInfo is false', () => {
    const { container } = renderCard({
      legType: LEGTYPE.MOVE,
      leg: walkLeg,
      nextLeg: busNextLeg,
      showDestinationInfo: false,
    });
    expect(container.querySelector('.notification-header')).toBeNull();
    expect(container.querySelector('.compact-boarding')).not.toBeNull();
  });

  it('renders a "board" prompt with full boarding info while waiting for a transit leg', () => {
    const { container } = renderCard({
      legType: LEGTYPE.WAIT,
      nextLeg: busNextLeg,
    });
    expect(container.textContent).toContain('Board');
    expect(container.textContent).toContain('55');
    expect(container.textContent).toContain('Downtown');
  });

  it('falls back to walking instructions instead of a blank card when the next leg is not transit', () => {
    const { container } = renderCard({
      legType: LEGTYPE.WAIT,
      nextLeg: walkLeg,
      showDestinationInfo: true,
    });
    expect(container.textContent).toContain('Walk to');
  });

  it('renders nothing for the non-transit WAIT fallback when showDestinationInfo is false', () => {
    const { container } = renderCard({
      legType: LEGTYPE.WAIT,
      nextLeg: walkLeg,
      showDestinationInfo: false,
    });
    expect(container.textContent).toBe('');
  });

  it('renders the resume time while waiting on board during an interline dwell', () => {
    const { container } = renderCard({
      legType: LEGTYPE.WAIT_IN_VEHICLE,
      nextLeg: { ...busNextLeg, start: at(interlineTime + 4 * 60000) },
    });
    expect(container.textContent).toContain('Wait on board');
    expect(container.textContent).toContain('4 min');
  });

  it('renders nothing for an unhandled leg type', () => {
    const { container } = renderCard({ legType: LEGTYPE.PENDING });
    expect(container.textContent).toBe('');
  });
});
