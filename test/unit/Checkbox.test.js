import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Checkbox from '../../app/component/Checkbox';

const renderWithIntl = (ui, messages = {}) =>
  render(
    <IntlProvider locale="en" messages={messages}>
      {ui}
    </IntlProvider>,
  );

describe('<Checkbox />', () => {
  it('should render a checkbox', () => {
    const { container } = renderWithIntl(<Checkbox onChange={() => {}} />);
    expect(container.querySelector('input[type="checkbox"]')).to.not.equal(
      null,
    );
  });

  it('should show the given label', () => {
    const { container } = renderWithIntl(
      <Checkbox labelId="citybike" onChange={() => {}} showLabel />,
      { citybike: 'City bike' },
    );
    expect(container.textContent).to.include('City bike');
  });

  it('Should work also without labelId', () => {
    const { container } = renderWithIntl(
      <Checkbox
        defaultMessage="ei tarvitse kääntää"
        onChange={() => {}}
        showLabel
      />,
    );
    expect(container.textContent).to.include('ei tarvitse kääntää');
  });

  it('should invoke onChange', () => {
    let wasCalled = false;
    const { container } = renderWithIntl(
      <Checkbox
        onChange={() => {
          wasCalled = true;
        }}
      />,
    );
    fireEvent.click(container.querySelector('input'));
    expect(wasCalled).to.equal(true);
  });

  it('should not invoke onChange when disabled', () => {
    let wasCalled = false;
    const { container } = renderWithIntl(
      <Checkbox
        disabled
        onChange={() => {
          wasCalled = true;
        }}
      />,
    );
    fireEvent.click(container.querySelector('input'));
    expect(wasCalled).to.equal(false);
  });

  it('wrapping element should mimic a checkbox event on keypress', () => {
    let receivedChecked;
    const { container } = renderWithIntl(
      <Checkbox
        checked
        onChange={e => {
          receivedChecked = e.target.checked;
        }}
      />,
    );
    const el = container.querySelector('.option-checkbox');
    fireEvent.keyPress(el, { key: 'Enter', charCode: 13 });
    expect(receivedChecked).to.equal(false);
  });
});
