import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import NaviCardExtension from '../../../../../app/component/itinerary/navigator/NaviCardExtension';
import { LEGTYPE } from '../../../../../app/component/itinerary/navigator/NaviUtils';
import { NaviCardType } from '../../../../../utils/shared/constants';
import { config, tram2, tram3, interlineTime } from './fixtures/interlineLegs';

const baseConfig = createTestConfig();

const transitLeg = {
  legId: 'leg1',
  mode: 'BUS',
  route: { type: 3, mode: 'BUS', color: '#000000', shortName: '55' },
  trip: { tripHeadsign: 'Keskusta' },
  headsign: 'Keskusta',
  stopCalls: [{}, {}, {}],
  to: {
    name: 'Stop A',
    stop: { parentStation: null, name: 'Stop A', vehicleMode: 'BUS' },
  },
  from: {},
};

const extensionBaseProps = {
  focusToPoint: () => {},
  legType: LEGTYPE.TRANSIT,
  time: 0,
  setCurrentCard: () => {},
  currentCard: NaviCardType.Default,
  leg: transitLeg,
  nextLeg: null,
};

describe('<NaviCardExtension />', () => {
  it('shows how many stops remain for a transit leg', () => {
    const { container } = renderWithProviders(
      <NaviCardExtension {...extensionBaseProps} />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('intermediate stop');
  });

  it('applies the configured color for the transit mode icon', () => {
    const { container } = renderWithProviders(
      <NaviCardExtension {...extensionBaseProps} />,
      { config: baseConfig },
    );
    expect(container.querySelector('.stop-count svg')?.style.fill).toBe(
      baseConfig.colors.bus,
    );
  });
});

const interlineBaseProps = {
  focusToPoint: () => {},
  legType: LEGTYPE.WAIT_IN_VEHICLE,
  leg: undefined,
  time: interlineTime,
  currentCard: NaviCardType.Default,
  setCurrentCard: () => {},
  previousLeg: tram2,
};

function renderWaitInVehicleCard(nextLeg) {
  return renderWithProviders(
    <NaviCardExtension {...interlineBaseProps} nextLeg={nextLeg} />,
    { config },
  );
}

describe('<NaviCardExtension /> interline wait-in-vehicle messaging', () => {
  it('names both the route number and destination when the interlined route differs', () => {
    const { container } = renderWaitInVehicleCard(tram3);
    expect(container.textContent).toContain('3');
    expect(container.textContent).toContain('Kauppatori');
  });

  it('only names the destination when the interlined route stays the same', () => {
    const sameRouteNext = { ...tram3, route: tram2.route };
    const { container } = renderWaitInVehicleCard(sameRouteNext);
    // same-route wording never mentions the (unchanged) route number.
    expect(container.textContent).not.toContain('route number');
    expect(container.textContent).toContain('Kauppatori');
  });
});
