import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';
import Icon from '../../../app/component/Icon';

describe('<ServiceAlertIcon />', () => {
  it('should render empty if there are no alerts', () => {
    const wrapper = shallowWithIntl(<ServiceAlertIcon />);
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render empty if the severity is falsy', () => {
    const wrapper = shallowWithIntl(
      <ServiceAlertIcon severityLevel={undefined} />,
    );
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render an info icon', () => {
    const wrapper = shallowWithIntl(
      <ServiceAlertIcon severityLevel={AlertSeverityLevelType.Info} />,
    );
    expect(wrapper.isEmptyRender()).to.equal(false);
    expect(wrapper.find(Icon).prop('className')).to.contain('info');
  });

  it('should render a caution icon', () => {
    const wrapper = shallowWithIntl(
      <ServiceAlertIcon severityLevel={AlertSeverityLevelType.Warning} />,
    );
    expect(wrapper.isEmptyRender()).to.equal(false);
    expect(wrapper.find(Icon).prop('className')).to.contain('caution');
  });
});
