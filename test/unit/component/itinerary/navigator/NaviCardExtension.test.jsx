import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import NaviCardExtension from '../../../../../app/component/itinerary/navigator/NaviCardExtension';
import { LEGTYPE } from '../../../../../app/component/itinerary/navigator/NaviUtils';
import { NaviCardType } from '../../../../../utils/shared/constants';

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

const baseProps = {
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
      <NaviCardExtension {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('intermediate stop');
  });

  it('applies the configured color for the transit mode icon', () => {
    const { container } = renderWithProviders(
      <NaviCardExtension {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.querySelector('.stop-count svg')?.style.fill).toBe(
      baseConfig.colors.bus,
    );
  });
});
