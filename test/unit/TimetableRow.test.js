import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import TimetableRow from '../../app/component/TimetableRow';

import data from './test-data/dt2720';

describe('<TimetableRow />', () => {
  it('should not show stoptimes whose routes have been filtered out', () => {
    const props = {
      ...data.matchingFilteredRoutes,
    };
    const wrapper = shallowWithIntl(<TimetableRow {...props} />);
    expect(wrapper.find('.timetablerow-linetime')).to.have.lengthOf(2);
  });

  it('should apply style "display: none" when no suitable departure times exist for the filtered routes', () => {
    const props = {
      ...data.nonMatchingFilteredRoutes,
    };
    const wrapper = shallowWithIntl(<TimetableRow {...props} />);
    expect(wrapper.find('.timetable-row').get(0).props.style).to.have.property(
      'display',
      'none',
    );
  });
});
