import React from 'react';
import sinon from 'sinon';

import { mockContext } from '../../../../helpers/mock-context';
import { shallowWithIntl } from '../../../../helpers/mock-intl-enzyme';
import StopMarker from '../../../../../../app/component/map/non-tile-layer/StopMarker';
import * as analytics from '../../../../../../app/util/analyticsUtils';

describe('<StopMarker />', () => {
  it.skip('should call addAnalyticsEvent when rendered', () => {
    const props = {
      stop: { gtfsId: 'HSL:1541157' },
      mode: 'BUS',
    };
    const spy = sinon.spy(analytics, 'addAnalyticsEvent');
    shallowWithIntl(<StopMarker {...props} />, {
      context: {
        ...mockContext,
        config: { map: { useModeIconsInNonTileLayer: true } },
      },
    });
    expect(spy.called).to.equal(true);
    spy.restore();
  });
});
