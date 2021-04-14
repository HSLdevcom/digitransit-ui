import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from '../helpers/mock-context';

import { Component as BubbleDialog } from '../../../app/component/BubbleDialog';

describe('<BubbleDialog />', () => {
  let trueCount = 0;
  it('should open the dialog', () => {
    const props = {
      header: 'about-this-service',
      id: 'TestDialog',
      icon: 'plus',
      isOpen: false,
      setOpen: isOpen => {
        if (isOpen) {
          trueCount += 1;
        }
      },
    };
    const wrapper = mountWithIntl(<BubbleDialog {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find('.bubble-dialog-container')).to.have.lengthOf(0);

    wrapper.find('.bubble-dialog-toggle').simulate('click');
    expect(trueCount).to.equal(1);

    // FIX TODO And uncomment these:
    // wrapper.find('.bubble-dialog-toggle').simulate('click');
    // expect(wrapper.find('.bubble-dialog-container')).to.have.lengthOf(0);
  });

  it('should call onDialogOpen once the dialog opens', () => {
    let callCount = 0;
    const props = {
      header: 'about-this-service',
      id: 'TestDialog',
      icon: 'plus',
      isOpen: true,
      setOpen: () => {
        callCount += 1;
      },
      onDialogOpen: () => {
        callCount += 1;
      },
    };
    const wrapper = mountWithIntl(<BubbleDialog {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper.find('.bubble-dialog-toggle').simulate('click');
    expect(callCount).to.equal(1);
  });
});
