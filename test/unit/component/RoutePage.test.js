import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { startRealTimeClient } from '../../../app/action/realTimeClientAction';
import { Component as RoutePage } from '../../../app/component/RoutePage';

describe('<RoutePage />', () => {
  it('should start the real time client after mounting', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: '/linjat/tampere:32/pysakit/tampere:32:1:01',
      },
      params: {
        patternId: 'tampere:32:1:01',
      },
      route: {
        gtfsId: 'tampere:32',
        mode: 'BUS',
      },
    };
    const context = {
      ...mockContext,
      config: {
        realTime: {
          tampere: {
            gtfsRt: 'foobar',
            routeSelector: () => '32',
          },
        },
      },
      executeAction: sinon.stub(),
    };

    shallowWithIntl(<RoutePage {...props} />, {
      context,
    });

    expect(context.executeAction.callCount).to.equal(1);
    expect(context.executeAction.args[0][0]).to.equal(startRealTimeClient);
  });
});
