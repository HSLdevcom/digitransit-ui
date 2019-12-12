import React from 'react';
import sinon from 'sinon';

import { mockContext } from '../../../../helpers/mock-context';
import { shallowWithIntl } from '../../../../helpers/mock-intl-enzyme';
import StopMarker from '../../../../../../app/component/map/non-tile-layer/StopMarker';
import * as analytics from '../../../../../../app/util/analyticsUtils';

describe('<StopMarker />', () => {
  it('should call addAnalyticsEvent when rendered', () => {
    const props = {
      stop: {},
      mode: 'BUS',
    };
    const spy = sinon.spy(analytics, 'addAnalyticsEvent');
    const wrapper = shallowWithIntl(<StopMarker {...props} />, {
      context: {
        ...mockContext,
        config: { map: { useModeIconsInNonTileLayer: true } },
      },
    });
    wrapper
      .find('RelayRootContainer')
      .first()
      .prop('renderFetched')();
    expect(spy.called).to.equal(true);
    spy.restore();
  });
});
