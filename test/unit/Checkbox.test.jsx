import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from './helpers/mock-providers';
import Checkbox from '../../app/component/Checkbox';

describe('<Checkbox />', () => {
  it('should render a checkbox', () => {
    const { container } = renderWithProviders(
      <Checkbox checked={false} defaultMessage="label" onChange={() => {}} />,
    );
    expect(container.querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it('should show the given label', () => {
    const { container } = renderWithProviders(
      <Checkbox
        checked={false}
        labelId="citybike"
        defaultMessage="City bike default"
        onChange={() => {}}
      />,
      { messages: { citybike: 'City bike' } },
    );
    expect(container.textContent).toContain('City bike');
  });

  it('Should work also without labelId', () => {
    const { container } = renderWithProviders(
      <Checkbox
        checked={false}
        defaultMessage="ei tarvitse kääntää"
        onChange={() => {}}
      />,
    );
    expect(container.textContent).toContain('ei tarvitse kääntää');
  });

  it('should invoke onChange', () => {
    let wasCalled = false;
    const { container } = renderWithProviders(
      <Checkbox
        checked={false}
        defaultMessage="label"
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
        checked={false}
        disabled
        defaultMessage="label"
        onChange={() => {
          wasCalled = true;
        }}
      />,
    );
    fireEvent.click(container.querySelector('input'));
    expect(wasCalled).toBe(false);
  });
});
