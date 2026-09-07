import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import Legs from '../../../app/component/itinerary/Legs';

describe('<Legs />', () => {
  it("should not fail to render even if the itinerary's legs array is empty", () => {
    const props = {
      itinerary: {
        endTime: 1542814001000,
        legs: [],
      },
      toggleCanceledLegsBanner: () => {},
      waitThreshold: 180,
      focusToPoint: () => {},
      focusToLeg: () => {},
      openSettings: () => {},
    };
    const { container } = renderWithProviders(<Legs {...props} />, {
      config: { CONFIG: 'default', URL: {}, itinerary: { waitThreshold: 5 } },
    });
    expect(container.innerHTML).to.equal('');
  });
});
