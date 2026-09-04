import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import IconWithBigCaution from '../../../app/component/IconWithBigCaution';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<IconWithBigCaution />', () => {
  it('should have a caution sub icon by default', () => {
    const { container } = renderWithProviders(
      <IconWithBigCaution img="foobar" />,
      { messages: { disruption: 'Disruption' } },
    );
    const icons = container.querySelectorAll('use');
    expect(icons[1].getAttribute('xlink:href')).to.equal(
      '#icon_caution-no-excl',
    );
  });

  it('should have a caution sub icon when alertSeverityLevel is high enough', () => {
    const { container } = renderWithProviders(
      <IconWithBigCaution
        alertSeverityLevel={AlertSeverityLevelType.Warning}
        img="foobar"
      />,
      { messages: { disruption: 'Disruption' } },
    );
    const icons = container.querySelectorAll('use');
    expect(icons[1].getAttribute('xlink:href')).to.equal(
      '#icon_caution-no-excl',
    );
  });

  it('should have an info sub icon when alertSeverityLevel is "INFO"', () => {
    const { container } = renderWithProviders(
      <IconWithBigCaution
        alertSeverityLevel={AlertSeverityLevelType.Info}
        img="foobar"
      />,
      { messages: { disruption: 'Disruption' } },
    );
    const icons = container.querySelectorAll('use');
    expect(icons[1].getAttribute('xlink:href')).to.equal('#icon_info');
  });
});
