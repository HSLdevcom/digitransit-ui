import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import FullscreenDialog from '../../../app/component/FullscreenDialog';
import {
  getDialogState,
  setDialogState,
} from '../../../app/store/localStorage';

describe('<FullscreenDialog />', () => {
  it('should have display set to none if already shown and showOnce is true', () => {
    setDialogState('foo');
    const props = {
      id: 'foo',
      initialIsOpen: true,
      renderContent: () => null,
      showOnce: true,
    };
    const wrapper = shallowWithIntl(<FullscreenDialog {...props} />);
    expect(wrapper.props().style).to.deep.equal({ display: 'none' });
  });

  it('should have display set to block even if already shown and showOnce is false', () => {
    setDialogState('foo');
    const props = {
      id: 'foo',
      initialIsOpen: true,
      renderContent: () => null,
      showOnce: false,
    };
    const wrapper = shallowWithIntl(<FullscreenDialog {...props} />);
    expect(wrapper.props().style).to.deep.equal({ display: 'block' });
  });

  it('should set dialogState to seen when rendered open', () => {
    const props = {
      id: 'foo',
      initialIsOpen: true,
      renderContent: () => null,
    };

    expect(getDialogState('foo')).to.equal(false);
    shallowWithIntl(<FullscreenDialog {...props} />);
    expect(getDialogState('foo')).to.equal(true);
  });

  it('should be rendered open if isOpen is true', () => {
    const props = {
      isOpen: true,
      renderContent: () => null,
    };
    const wrapper = shallowWithIntl(<FullscreenDialog {...props} />);
    expect(wrapper.props().style).to.deep.equal({ display: 'block' });
  });

  it('should call renderContent', () => {
    let wasCalled = false;
    const props = {
      initialIsOpen: true,
      renderContent: () => {
        wasCalled = true;
        return null;
      },
    };
    shallowWithIntl(<FullscreenDialog {...props} />);
    expect(wasCalled).to.equal(true);
  });

  it('should call the given toggle function if given', () => {
    let wasCalled = false;
    const props = {
      isOpen: true,
      renderContent: () => null,
      toggle: () => {
        wasCalled = true;
      },
    };
    const wrapper = shallowWithIntl(<FullscreenDialog {...props} />);
    wrapper.find('.close-popup > button').simulate('click');
    expect(wasCalled).to.equal(true);
  });

  it('should not render the close button if disabled', () => {
    const props = {
      initialIsOpen: true,
      renderContent: () => null,
      showCloseButton: false,
    };
    const wrapper = shallowWithIntl(<FullscreenDialog {...props} />);
    expect(wrapper.find('.close-popup')).to.have.lengthOf(0);
  });

  it('should not set anything to localStorage if the id is not set', () => {
    const props = {
      initialIsOpen: true,
      renderContent: () => null,
    };
    shallowWithIntl(<FullscreenDialog {...props} />);
    expect(window.localStorage).to.be.empty; //eslint-disable-line
  });

  it('should set isOpen when toggled', () => {
    const props = {
      renderContent: () => null,
    };
    const wrapper = shallowWithIntl(<FullscreenDialog {...props} />);
    wrapper.instance().toggle();
    expect(wrapper.state().isOpen).to.equal(true);
  });
});
