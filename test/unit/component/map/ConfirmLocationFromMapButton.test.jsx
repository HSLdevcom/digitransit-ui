import React from 'react';
import { fireEvent } from '@testing-library/react';
import { DomEvent } from 'leaflet';
import { renderWithProviders } from '../../helpers/mock-providers';
import ConfirmLocationFromMapButton from '../../../../app/component/map/ConfirmLocationFromMapButton';

describe('<ConfirmLocationFromMapButton />', () => {
  const getProps = (overrideProps = {}) => ({
    isEnabled: true,
    address: 'Test address::60.1,24.9',
    title: 'Confirm selection',
    type: 'origin',
    onConfirm: vi.fn(),
    color: '#000',
    hoverColor: '#333',
    ...overrideProps,
  });

  it('calls onConfirm when clicked', () => {
    const props = getProps();
    const { getByText } = renderWithProviders(
      <ConfirmLocationFromMapButton {...props} />,
    );
    fireEvent.click(getByText('Confirm selection'));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('marks its click as skipped for Leaflet map-level click handling', () => {
    // The button is rendered as a plain DOM node inside Leaflet's map
    // container rather than as a proper Leaflet control. Without
    // L.DomEvent.disableClickPropagation, tapping it would also trigger the
    // map's own container-level click handling (which can hit-test and
    // navigate to an underlying station/terminal). Leaflet's own map click
    // dispatch (`Map._handleDOMEvent`) bails out early whenever
    // `DomEvent.skipped(e)` is true for that event type - which is exactly
    // the flag `disableClickPropagation` sets on a node's click handler -
    // so asserting that flag is the direct, canonical way to verify the fix.
    const props = getProps();
    const { getByText } = renderWithProviders(
      <ConfirmLocationFromMapButton {...props} />,
    );
    fireEvent.click(getByText('Confirm selection'));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(DomEvent.skipped({ type: 'click' })).toBe(true);
  });

  it('does not call onConfirm when disabled', () => {
    const props = getProps({ isEnabled: false, address: undefined });
    const { getByText } = renderWithProviders(
      <ConfirmLocationFromMapButton {...props} />,
    );
    fireEvent.click(getByText('Confirm selection'));
    expect(props.onConfirm).not.toHaveBeenCalled();
  });
});
