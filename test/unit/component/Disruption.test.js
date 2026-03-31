import React from 'react';
import sinon from 'sinon';
import * as found from 'found';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import Icon from '../../../app/component/Icon';
import Disruption from '../../../app/component/Disruption';
import { AlertEntityType } from '../../../app/constants';
import { PREFIX_STOPS, routePagePath } from '../../../app/util/path';
import { mockContext } from '../helpers/mock-context';
import * as ConfigContext from '../../../app/configurations/ConfigContext';

describe('<Disruption />', () => {
  beforeEach(() => {
    sinon.stub(ConfigContext, 'useConfigContext').returns(mockContext.config);
    sinon
      .stub(found, 'useRouter')
      .returns({ match: mockContext.match, router: mockContext.router });
  });

  afterEach(() => {
    ConfigContext.useConfigContext.restore();
    found.useRouter.restore();
  });
  it('should not render a div for the alert if description is missing', () => {
    const props = {
      expired: false,
      index: 0,
      feed: 'foo',
      entities: [
        {
          __typename: AlertEntityType.Route,
          mode: 'BUS',
          shortName: '1',
          gtfsId: 'foo:1',
        },
      ],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.alert-row')).to.have.lengthOf(0);
  });

  it('should not render a div for the header if it is missing', () => {
    const props = {
      expired: false,
      description: 'Lorem ipsum',
      index: 0,
      feed: 'foo',
      entities: [
        {
          __typename: AlertEntityType.Route,
          mode: 'BUS',
          shortName: '1',
          gtfsId: 'foo:1',
        },
      ],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.alert-header')).to.have.lengthOf(0);
  });

  it('should render an Icon if a mode is provided, has description and the type is stop', () => {
    const props = {
      feed: 'foo',
      entities: [
        {
          __typename: AlertEntityType.Stop,
          gtfsId: 'foo:1',
        },
      ],
      description: 'Lorem ipsum',
      index: 0,
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find(Icon)).to.have.lengthOf(1);
  });

  it('should render the identifier', () => {
    const props = {
      gtfsIds: 'HSL:2097N',
      description: 'Lorem ipsum',
      index: 0,
      feed: 'foo',
      entities: [
        {
          __typename: AlertEntityType.Route,
          mode: 'BUS',
          shortName: '97N',
          gtfsId: 'foo:1',
        },
      ],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.bus')).to.have.lengthOf(1);
  });

  it('should render link for route', () => {
    const props = {
      showLinks: true,
      description: 'Lorem ipsum',
      index: 0,
      feed: 'foo',
      entities: [
        {
          __typename: AlertEntityType.Route,
          mode: 'BUS',
          shortName: '97N',
          gtfsId: 'HSL:2097N',
        },
      ],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.alert-row-link').get(0).props.to).to.equal(
      routePagePath('HSL:2097N', PREFIX_STOPS),
    );
  });
});
