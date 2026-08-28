import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { Component as StopPageTabs } from '../../../app/component/stop/StopPageTabs';

describe('<StopPageTabs />', () => {
  it('should render empty if stop information is missing', () => {
    const props = {
      breakpoint: 'large',
      children: <div />,
      routes: [],
      stop: null,
    };
    const { container } = renderWithProviders(<StopPageTabs {...props} />);
    expect(container.innerHTML).to.equal('');
  });
});
