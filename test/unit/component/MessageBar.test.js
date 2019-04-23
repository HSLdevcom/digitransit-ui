import React from 'react';
import Tab from 'material-ui/Tabs/Tab';

import { Component as MessageBar } from '../../../app/component/MessageBar';
import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

const defaultProps = {
  getServiceAlertsAsync: async () => [],
  lang: 'fi',
  messages: [],
};

describe('<MessageBar />', () => {
  it('should render empty if there are no messages', () => {
    const props = { ...defaultProps };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context: mockContext,
    });
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render the service alert tab', async () => {
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => [
        {
          alertDescriptionText: 'bar',
          alertHeaderText: 'foo',
        },
      ],
    };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context: mockContext,
    });
    await wrapper.instance().componentDidMount();
    expect(wrapper.find(Tab)).to.have.lengthOf(1);
    expect(wrapper.debug()).to.equal(undefined);
  });

  it('should not show a closed service alert tab again', () => {
    expect(false).to.equal(true);
  });
});
