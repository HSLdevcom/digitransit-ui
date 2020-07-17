import React from 'react';
import { ReactRelayContext } from 'react-relay';
import { expect } from 'chai';
import { describe, it } from 'mocha';
// import { createWaitForElement } from 'enzyme-wait';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import DisruptionInfo from '../../app/component/DisruptionInfo';
import { mockContext, mockChildContextTypes } from './helpers/mock-context';
// import Modal from '../../app/component/Modal';

// const waitForModal = createWaitForElement('.modal');

describe('DisruptionInfo', () => {
  it('should render empty when no disruptionInfoOpen has been given', () => {
    const environment = {};
    const wrapper = mountWithIntl(
      <ReactRelayContext.Provider value={{ environment }}>
        <DisruptionInfo isBrowser />
      </ReactRelayContext.Provider>,
      {
        context: {
          ...mockContext,
          config: {
            feedIds: [],
          },
          match: {
            ...mockContext.match,
            location: {
              ...mockContext.match.location,
              state: {},
            },
          },
        },
        childContextTypes: {
          ...mockChildContextTypes,
        },
      },
    );
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render empty when disruptionInfoOpen=false', () => {
    const environment = {};
    const wrapper = mountWithIntl(
      <ReactRelayContext.Provider value={{ environment }}>
        <DisruptionInfo isBrowser />
      </ReactRelayContext.Provider>,
      {
        context: {
          ...mockContext,
          config: {
            feedIds: [],
          },
          match: {
            ...mockContext.match,
            location: {
              ...mockContext.match.location,
              state: {
                disruptionInfoOpen: false,
              },
            },
          },
        },
        childContextTypes: {
          ...mockChildContextTypes,
        },
      },
    );
    expect(wrapper.isEmptyRender()).to.equal(true);
  });
  /*
TODO: Fix context mock later
  it('should return a Modal when disruptionInfoOpen=true', async () => {
    const environment = createMockEnvironment();
    const lazyloadWrapper = mountWithIntl(
      <ReactRelayContext.Provider value={{ environment }}>
        <DisruptionInfo isBrowser />
      </ReactRelayContext.Provider>,
      {
        context: {
          ...mockContext,
          config: {
            feedIds: [],
          },
          match: {
            ...mockContext.match,
            location: {
              ...mockContext.match.location,
              state: {
                disruptionInfoOpen: true,
              },
            },
          },
        },
        childContextTypes: {
          ...mockChildContextTypes,
        },
      },
    );
    expect(lazyloadWrapper.find(Modal)).to.have.lengthOf(1);
  }); */
});
