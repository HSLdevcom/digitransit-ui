import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import NaviInstructions from '../../../../../app/component/itinerary/navigator/NaviInstructions';
import { LEGTYPE } from '../../../../../app/component/itinerary/navigator/NaviUtils';

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
