import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import Icon from '../../../app/component/Icon';
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

  it('should render an Icon with a specific img', () => {
    const wrapper = shallowWithIntl(<ZoneIcon zoneId="A" />);
    expect(wrapper.find(Icon)).to.have.lengthOf(1);
    expect(wrapper.find(Icon).props().img).to.equal('icon-icon_zone-a');
  });

  it('should render a title and an Icon', () => {
    const wrapper = shallowWithIntl(<ZoneIcon showTitle zoneId="A" />);
    expect(wrapper.text()).to.include('Zone');
    expect(wrapper.find(Icon)).to.have.lengthOf(1);
  });
});
