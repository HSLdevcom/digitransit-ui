import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import defaultConfig from '../../../app/configurations/config.default';
import { getDefaultSettings } from '../../../app/util/planParamUtil';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import SaveCustomizedSettingsButton from '../../../app/component/SaveCustomizedSettingsButton';
import { mockContext } from '../helpers/mock-context';

describe('<SaveCustomizedSettingsButton />', () => {
  it('should call noSettingsFound if the query does not contain any settings', () => {
    const context = {
      ...mockContext,
      config: defaultConfig,
    };
    context.location.query = {};

    let wasCalled = false;
    const callback = () => {
      wasCalled = true;
    };

    const wrapper = shallowWithIntl(
      <SaveCustomizedSettingsButton noSettingsFound={callback} />,
      {
        context,
      },
    );
    wrapper.find('.save-settings-button').simulate('click');
    expect(wasCalled).to.equal(true);
  });

  it('should call noSettingsFound if the query contains only default settings', () => {
    const context = {
      ...mockContext,
      config: defaultConfig,
    };
    context.location.query = getDefaultSettings(defaultConfig);

    let wasCalled = false;
    const callback = () => {
      wasCalled = true;
    };

    const wrapper = shallowWithIntl(
      <SaveCustomizedSettingsButton noSettingsFound={callback} />,
      {
        context,
      },
    );
    wrapper.find('.save-settings-button').simulate('click');
    expect(wasCalled).to.equal(true);
  });
});
