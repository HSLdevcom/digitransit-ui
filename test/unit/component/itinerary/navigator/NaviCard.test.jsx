import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import NaviCard from '../../../../../app/component/itinerary/navigator/NaviCard';
import { LEGTYPE } from '../../../../../app/component/itinerary/navigator/NaviUtils';

const baseConfig = createTestConfig();

const transitLeg = {
  legId: 'leg1',
  mode: 'BUS',
  route: { type: 3, mode: 'BUS', color: '#000000', shortName: '55' },
  trip: { tripHeadsign: 'Keskusta' },
  headsign: 'Keskusta',
  stopCalls: [],
  to: {
    name: 'Stop A',
    stop: { parentStation: null, name: 'Stop A', vehicleMode: 'BUS' },
  },
  from: {},
  end: { scheduledTime: new Date().toISOString() },
};

const baseProps = {
  focusToPoint: () => {},
  legType: LEGTYPE.TRANSIT,
  time: 0,
  tailLength: 0,
  cardAnimation: '',
  leg: transitLeg,
  nextLeg: null,
};

describe('<NaviCard />', () => {
  it('applies the configured color for the transit mode icon', () => {
    const { container } = renderWithProviders(<NaviCard {...baseProps} />, {
      config: baseConfig,
    });
    expect(container.querySelector('.mode')?.style.fill).toBe(
      baseConfig.colors.bus,
    );
  });

  it('renders nothing when there is no leg or nextLeg', () => {
    const { container } = renderWithProviders(
      <NaviCard {...baseProps} leg={null} nextLeg={null} />,
      { config: baseConfig },
    );
    expect(container.textContent).toBe('');
  });

  it('renders nothing for a pending legType', () => {
    const { container } = renderWithProviders(
      <NaviCard {...baseProps} legType={LEGTYPE.PENDING} />,
      { config: baseConfig },
    );
    expect(container.textContent).toBe('');
  });
});
