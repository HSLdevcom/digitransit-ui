import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import SearchSettings from '../../../app/component/itinerary/SearchSettings';

describe('<SearchSettings />', () => {
  it('should render time picker', () => {
    const { container } = renderWithProviders(
      <SearchSettings toggleSettings={() => {}} />,
    );
    expect(container.querySelector('fieldset')).to.not.equal(null);
  });
});
