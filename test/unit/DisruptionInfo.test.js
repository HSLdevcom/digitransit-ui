import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';

import DisruptionInfo from '../../app/component/DisruptionInfo';
import Modal from '../../app/component/Modal';

describe('DisruptionInfo', () => {
  it('should return null when isBrowser=false', () => {
    const wrapper = shallowWithIntl(<DisruptionInfo isBrowser={false} />);
    expect(wrapper.getElement()).to.equal(null);
  });

  it('should return null when no disruptionInfoOpen has been given', () => {
    const wrapper = shallowWithIntl(<DisruptionInfo isBrowser />, {
      context: {
        location: {
          state: {},
        },
      },
    });
    expect(wrapper.getElement()).to.equal(null);
  });

  it('should return null when disruptionInfoOpen=false', () => {
    const wrapper = shallowWithIntl(<DisruptionInfo isBrowser />, {
      context: {
        location: {
          state: {
            disruptionInfoOpen: false,
          },
        },
      },
    });
    expect(wrapper.getElement()).to.equal(null);
  });

  it('should return a Modal when disruptionInfoOpen=true', () => {
    const wrapper = shallowWithIntl(<DisruptionInfo isBrowser />, {
      context: {
        config: {
          feedIds: [],
        },
        location: {
          state: {
            disruptionInfoOpen: true,
          },
        },
      },
    });
    expect(wrapper.find(Modal)).to.have.lengthOf(1);
  });
});
