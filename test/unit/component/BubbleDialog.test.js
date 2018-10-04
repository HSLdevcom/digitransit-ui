import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from '../helpers/mock-context';

import { Component as BubbleDialog } from '../../../app/component/BubbleDialog';

describe('<BubbleDialog />', () => {
  it('should open and close the dialog', () => {
    const props = {
      header: 'about-this-service',
      id: 'TestDialog',
      icon: 'plus',
    };
    const wrapper = mountWithIntl(<BubbleDialog {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find('.bubble-dialog-container')).to.have.lengthOf(0);

    wrapper.find('.bubble-dialog-toggle').simulate('click');
    expect(wrapper.find('.bubble-dialog-container')).to.have.lengthOf(1);

    wrapper.find('.bubble-dialog-toggle').simulate('click');
    expect(wrapper.find('.bubble-dialog-container')).to.have.lengthOf(0);
  });

  it('should call onDialogOpen once the dialog opens', () => {
    let callCount = 0;
    const props = {
      header: 'about-this-service',
      id: 'TestDialog',
      icon: 'plus',
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

  it('should render the given content once open', () => {
    const props = {
      header: 'about-this-service',
      id: 'TestDialog',
      icon: 'plus',
    };
    const wrapper = mountWithIntl(
      <BubbleDialog {...props}>
        <div className="foo">bar</div>
      </BubbleDialog>,
      {
        context: { ...mockContext },
        childContextTypes: { ...mockChildContextTypes },
      },
    );
    expect(wrapper.find('.foo')).to.have.lengthOf(0);

    wrapper.find('.bubble-dialog-toggle').simulate('click');
    expect(wrapper.find('.foo')).to.have.lengthOf(1);
  });
});
