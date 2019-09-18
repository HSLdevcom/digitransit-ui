import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import DisruptionInfo from '../../app/component/DisruptionInfo';
// import { createWaitForElement } from 'enzyme-wait';
// import { mockContext, mockChildContextTypes } from './helpers/mock-context';
// import { createMemoryMockRouter } from './helpers/mock-router';
// import Modal from '../../app/component/Modal';

// const waitForModal = createWaitForElement('Modal');

describe('DisruptionInfo', () => {
  it('should render empty when isBrowser=false', () => {
    const wrapper = shallowWithIntl(<DisruptionInfo isBrowser={false} />, {
      context: {
        location: {},
      },
    });
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render empty when no disruptionInfoOpen has been given', () => {
    const wrapper = shallowWithIntl(<DisruptionInfo isBrowser />, {
      context: {
        location: {
          state: {},
        },
      },
    });
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render empty when disruptionInfoOpen=false', () => {
    const wrapper = shallowWithIntl(<DisruptionInfo isBrowser />, {
      context: {
        location: {
          state: {
            disruptionInfoOpen: false,
          },
        },
      },
    });
    expect(wrapper.isEmptyRender()).to.equal(true);
  });
  /*
TODO: Fix context mock later
  it('should return a Modal when disruptionInfoOpen=true', async () => {
    const lazyloadWrapper = mountWithIntl(<DisruptionInfo isBrowser />, {
      context: {
        ...mockContext,
        config: {
          feedIds: [],
        },
        location: {
          ...mockContext.location,
          action: 'POP',
          state: {
            disruptionInfoOpen: true,
          },
        },
        router: createMemoryMockRouter(),
      },
      childContextTypes: {
        ...mockChildContextTypes,
      },
    });
    const componentReady = await waitForModal(lazyloadWrapper);
    expect(componentReady.find(Modal)).to.have.lengthOf(1);
  });
  */
});
