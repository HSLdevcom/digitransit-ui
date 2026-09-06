import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from './helpers/mock-providers';
import Checkbox from '../../app/component/Checkbox';

describe('<Checkbox />', () => {
  it('should render a checkbox', () => {
    const { container } = renderWithProviders(<Checkbox onChange={() => {}} />);
    expect(container.querySelector('input[type="checkbox"]')).not.toBe(null);
  });

  it('should show the given label', () => {
    const { container } = renderWithProviders(
      <Checkbox labelId="citybike" onChange={() => {}} showLabel />,
      { messages: { citybike: 'City bike' } },
    );
    expect(container.textContent).toContain('City bike');
  });

  it('Should work also without labelId', () => {
    const { container } = renderWithProviders(
      <Checkbox
        defaultMessage="ei tarvitse kääntää"
        onChange={() => {}}
        showLabel
      />,
    );
    expect(container.textContent).toContain('ei tarvitse kääntää');
  });

  it('should invoke onChange', () => {
    let wasCalled = false;
    const { container } = renderWithProviders(
      <Checkbox
        onChange={() => {
          wasCalled = true;
        }}
      />,
    );
    fireEvent.click(container.querySelector('input'));
    expect(wasCalled).toBe(true);
  });

  it('should not invoke onChange when disabled', () => {
    let wasCalled = false;
    const { container } = renderWithProviders(
      <Checkbox
        disabled
        onChange={() => {
          wasCalled = true;
        }}
      />,
    );
    fireEvent.click(container.querySelector('input'));
    expect(wasCalled).toBe(false);
  });

  it('wrapping element should mimic a checkbox event on keypress', () => {
    let receivedChecked;
    const { container } = renderWithProviders(
      <Checkbox
        checked
        onChange={e => {
          receivedChecked = e.target.checked;
        }}
      />,
    );
    const el = container.querySelector('.option-checkbox');
    fireEvent.keyPress(el, { key: 'Enter', charCode: 13 });
    expect(receivedChecked).toBe(false);
  });
});
