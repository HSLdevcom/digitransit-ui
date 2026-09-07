import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockMatch } from '../helpers/mock-router';
import { Component as StopPageContentContainer } from '../../../app/component/stop/StopPageContentContainer';

describe('<StopPageContentContainer />', () => {
  it("should show a 'no departures' indicator", () => {
    const props = {
      params: {
        stopId: '1234',
      },
      relay: {
        refetch: () => {},
        environment: {},
      },
      stop: {},
      match: mockMatch,
    };
    const { container } = renderWithProviders(
      <StopPageContentContainer {...props} />,
      { currentTime: 0 },
    );
    expect(
      container.querySelector('.stop-no-departures-container'),
    ).to.not.equal(null);
  });
});
