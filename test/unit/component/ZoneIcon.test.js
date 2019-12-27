import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import ZoneIcon, { ZONE_UNKNOWN } from '../../../app/component/ZoneIcon';

describe('<ZoneIcon />', () => {
  it('should not render if zoneId is missing', () => {
    const wrapper = shallowWithIntl(<ZoneIcon />);
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should not render if the title should be shown but the zone is unknown', () => {
    const wrapper = shallowWithIntl(
      <ZoneIcon showTitle zoneId={ZONE_UNKNOWN} />,
    );
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render a placeholder if the zone is unknown', () => {
    const wrapper = shallowWithIntl(<ZoneIcon zoneId={ZONE_UNKNOWN} />);
    expect(wrapper.text()).to.equal('?');
  });
});
