import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import ScheduleHeader, {
  getScheduleHeaderOptions,
} from '../../../../app/component/routepage/schedule/ScheduleHeader';

describe('<ScheduleHeader />', () => {
  const stops = [
    { id: 'stop1', name: 'First Stop' },
    { id: 'stop2', name: 'Second Stop' },
    { id: 'stop3', name: 'Third Stop' },
    { id: 'stop4', name: 'Fourth Stop' },
  ];

  const defaultProps = {
    stops,
    from: 0,
    to: 3,
    onFromSelectChange: () => {},
    onToSelectChange: () => {},
  };

  it('should display the selected origin and destination names', () => {
    const { container } = renderWithProviders(
      <ScheduleHeader {...defaultProps} />,
    );
    expect(
      container.querySelector('.printable-stop-header_from').textContent,
    ).to.equal('First Stop');
    expect(
      container.querySelector('.printable-stop-header_to').textContent,
    ).to.equal('Fourth Stop');
  });

  it('should update displayed names when the selected stops change', () => {
    const { container } = renderWithProviders(
      <ScheduleHeader {...defaultProps} from={2} to={3} />,
    );
    expect(
      container.querySelector('.printable-stop-header_from').textContent,
    ).to.equal('Third Stop');
    expect(
      container.querySelector('.printable-stop-header_to').textContent,
    ).to.equal('Fourth Stop');
  });

  it('should update only the origin display when origin changes', () => {
    const { container } = renderWithProviders(
      <ScheduleHeader {...defaultProps} from={2} />,
    );
    expect(
      container.querySelector('.printable-stop-header_from').textContent,
    ).to.equal('Third Stop');
    expect(
      container.querySelector('.printable-stop-header_to').textContent,
    ).to.equal('Fourth Stop');
  });

  it('should update only the destination display when destination changes', () => {
    const { container } = renderWithProviders(
      <ScheduleHeader {...defaultProps} to={1} />,
    );
    expect(
      container.querySelector('.printable-stop-header_from').textContent,
    ).to.equal('First Stop');
    expect(
      container.querySelector('.printable-stop-header_to').textContent,
    ).to.equal('Second Stop');
  });

  it('should only offer origin stops before the destination', () => {
    const { fromOptions } = getScheduleHeaderOptions(stops, 0, 3);
    expect(fromOptions).to.deep.equal([
      { label: 'First Stop', value: 0 },
      { label: 'Second Stop', value: 1 },
      { label: 'Third Stop', value: 2 },
    ]);
  });

  it('should only offer destination stops after the origin', () => {
    const { toOptions } = getScheduleHeaderOptions(stops, 0, 3);
    expect(toOptions).to.deep.equal([
      { label: 'Second Stop', value: 1 },
      { label: 'Third Stop', value: 2 },
      { label: 'Fourth Stop', value: 3 },
    ]);
  });

  it('should handle a two-stop route', () => {
    const twoStops = [
      { id: 'stop1', name: 'Start' },
      { id: 'stop2', name: 'End' },
    ];
    const { fromOptions, toOptions } = getScheduleHeaderOptions(twoStops, 0, 1);
    expect(fromOptions).to.have.lengthOf(1);
    expect(toOptions).to.have.lengthOf(1);
  });

  it('should handle many stops', () => {
    const manyStops = Array.from({ length: 20 }, (_, i) => ({
      id: `stop${i}`,
      name: `Stop ${i + 1}`,
    }));
    const { fromOptions, toOptions } = getScheduleHeaderOptions(
      manyStops,
      0,
      19,
    );
    expect(fromOptions).to.have.lengthOf(19);
    expect(toOptions).to.have.lengthOf(19);
  });
});
