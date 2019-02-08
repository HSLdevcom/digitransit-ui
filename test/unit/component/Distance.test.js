import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import Distance from '../../../app/component/Distance';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

describe('<Distance />', () => {
  it('should round the distance down to 0m', () => {
    const wrapper = shallowWithIntl(<Distance distance={7} />, {
      context: {
        config: {
          imperialEnabled: false,
        },
      },
    });
    expect(wrapper.find('.distance').text()).to.equal('0m');
  });

  it('should round the distance to nearest 10m', () => {
    const wrapper = shallowWithIntl(<Distance distance={123} />, {
      context: {
        config: {
          imperialEnabled: false,
        },
      },
    });
    expect(wrapper.find('.distance').text()).to.equal('120m');
  });

  it('should round the distance to kilometers with one decimal place', () => {
    const wrapper = shallowWithIntl(<Distance distance={3040} />, {
      context: {
        config: {
          imperialEnabled: false,
        },
      },
    });
    expect(wrapper.find('.distance').text()).to.equal('3.0km');
  });

  it('should show the distance in imperial units', () => {
    const currentLanguage = navigator.language;
    navigator.language = 'en-us';
    const wrapper = shallowWithIntl(<Distance distance={1609.34} />, {
      context: {
        config: {
          imperialEnabled: true,
        },
      },
    });
    expect(wrapper.find('.distance').text()).to.equal('1 mi');
    navigator.language = currentLanguage;
  });
});
