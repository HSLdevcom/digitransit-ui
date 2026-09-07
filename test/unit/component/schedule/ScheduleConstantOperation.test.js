import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { renderWithProviders } from '../../helpers/mock-providers';

import ScheduleConstantOperation from '../../../../app/component/routepage/schedule/ScheduleConstantOperation';
import { mockMatch } from '../../helpers/mock-router';

describe('<ScheduleConstantOperation />', () => {
  const defaultProps = {
    constantOperationInfo: {
      text: 'This route operates continuously 24/7.',
      link: 'https://example.com/route-info',
    },
    match: mockMatch,
    route: {
      gtfsId: 'HSL:1001',
      shortName: '1',
      longName: 'Route 1',
      mode: 'BUS',
      type: 3,
      agency: { name: 'HSL' },
    },
    breakpoint: 'large',
  };

  it('should render RouteControlPanel', () => {
    const { container } = renderWithProviders(
      <ScheduleConstantOperation {...defaultProps} />,
    );
    expect(container.querySelector('.constant-operation-panel')).to.not.equal(
      null,
    );
  });

  it('should display constant operation text', () => {
    const { container } = renderWithProviders(
      <ScheduleConstantOperation {...defaultProps} />,
    );
    expect(
      container.querySelector('.constant-operation-content').textContent,
    ).to.include('This route operates continuously 24/7.');
  });

  it('should open link in new tab', () => {
    const { container } = renderWithProviders(
      <ScheduleConstantOperation {...defaultProps} />,
    );
    const link = container.querySelector('a');

    expect(link.getAttribute('target')).to.equal('_blank');
    expect(link.getAttribute('rel')).to.equal('noreferrer');
  });

  it('should apply mobile class when breakpoint is not large', () => {
    const props = { ...defaultProps, breakpoint: 'small' };
    const { container } = renderWithProviders(
      <ScheduleConstantOperation {...props} />,
    );
    expect(
      container
        .querySelector('.route-schedule-container')
        .classList.contains('mobile'),
    ).to.equal(true);
  });
});
