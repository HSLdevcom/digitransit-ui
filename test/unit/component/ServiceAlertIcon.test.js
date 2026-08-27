import React from 'react';
import { render } from '@testing-library/react';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<ServiceAlertIcon />', () => {
  it('should render empty if there are no alerts', () => {
    const { container } = render(<ServiceAlertIcon />);
    expect(container.querySelector('.icon')).to.equal(null);
  });

  it('should render empty if the severity is falsy', () => {
    const { container } = render(
      <ServiceAlertIcon severityLevel={undefined} />,
    );
    expect(container.querySelector('.icon')).to.equal(null);
  });

  it('should render an info icon', () => {
    const { container } = render(
      <ServiceAlertIcon severityLevel={AlertSeverityLevelType.Info} />,
    );
    expect(container.querySelector('.info')).to.not.equal(null);
  });

  it('should render a caution icon', () => {
    const { container } = render(
      <ServiceAlertIcon severityLevel={AlertSeverityLevelType.Warning} />,
    );
    expect(container.querySelector('.caution')).to.not.equal(null);
  });
});
