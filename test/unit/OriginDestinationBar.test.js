import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createMemoryHistory } from 'react-router';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import OriginDestinationBar from '../../app/component/OriginDestinationBar';
import { replaceQueryParams } from '../../app/util/queryUtils';

describe('<OriginDestinationBar />', () => {
  // TODO: this component does not initialize anything from the url
  // it('should initialize viapoints from url', () => {
  //   wrapper.setState({ isViaPoint: true, viaPointNames: exampleViapoints });
  //   expect(wrapper.state('viaPointNames')).to.equal(exampleViapoints);
  // });

  describe('swapEndpoints', () => {
    it('should also swap via points in the query', () => {
      const props = {
        destination: {},
        origin: {},
      };

      const router = createMemoryHistory();
      router.isActive = () => {};
      router.setRouteLeaveHook = () => {};

      replaceQueryParams(router, {
        intermediatePlaces: [
          'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
          'Kamppi 1241, Helsinki::60.169119,24.932058',
        ],
      });

      const comp = mountWithIntl(<OriginDestinationBar {...props} />, {
        context: {
          ...mockContext,
          router,
        },
        childContextTypes: mockChildContextTypes,
      });

      comp.find('.itinerary-search-control > .switch').simulate('click');

      expect(
        router.getCurrentLocation().query.intermediatePlaces,
      ).to.deep.equal([
        'Kamppi 1241, Helsinki::60.169119,24.932058',
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
      ]);
    });
  });
});
