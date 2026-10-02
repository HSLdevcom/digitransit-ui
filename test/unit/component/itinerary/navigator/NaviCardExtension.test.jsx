import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import NaviCardExtension from '../../../../../app/component/itinerary/navigator/NaviCardExtension';
import { LEGTYPE } from '../../../../../app/component/itinerary/navigator/NaviUtils';
import { NaviCardType } from '../../../../../utils/shared/constants';
import { config, tram2, tram3, interlineTime } from './fixtures/interlineLegs';

const baseProps = {
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
    <NaviCardExtension {...baseProps} nextLeg={nextLeg} />,
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
