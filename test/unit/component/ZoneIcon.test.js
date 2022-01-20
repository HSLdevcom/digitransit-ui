import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import ZoneIcon from '../../../app/component/ZoneIcon';

const config = {
  unknownZones: ['FOO'],
};

describe('<ZoneIcon />', () => {
  it('should not render if zoneId is missing', () => {
    const wrapper = shallowWithIntl(<ZoneIcon />);
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should not render unknown zone if the unknown zones should not be shown', () => {
    const wrapper = shallowWithIntl(
      <ZoneIcon zoneId="FOO" showUnknown={false} />,
      {
        context: {
          config,
        },
      },
    );
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render a placeholder if the zone is unknown', () => {
    const wrapper = shallowWithIntl(<ZoneIcon zoneId="FOO" showUnknown />, {
      context: {
        config,
      },
    });
    expect(wrapper.find('.unknown').text()).to.equal('?');
  });
});
