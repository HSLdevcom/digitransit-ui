import React from 'react';

import { renderWithProviders } from '../helpers/mock-providers';
import Disruption from '../../../app/component/Disruption';
import { AlertEntityType } from '../../../utils/shared/constants';

describe('<Disruption />', () => {
  const routeEntity = {
    __typename: AlertEntityType.Route,
    id: 'route-1',
    mode: 'BUS',
    shortName: '1',
    gtfsId: 'HSL:2097N',
    color: '000000',
  };

  const baseProps = {
    id: 'alert1',
    index: 0,
    toggleDetails: () => {},
    alertDescriptionText: 'Lorem ipsum',
    alertHeaderText: 'Service alert',
    alertEffect: 'CANCELLATION',
    alertSeverityLevel: 'SEVERE',
    entities: [routeEntity],
  };

  it('should not render when description and header are missing', () => {
    const { container } = renderWithProviders(
      <Disruption
        {...baseProps}
        alertDescriptionText={undefined}
        alertHeaderText={undefined}
      />,
    );
    expect(container.querySelector('.alert-row')).to.equal(null);
  });

  it('should render when a header is provided', () => {
    const { container } = renderWithProviders(<Disruption {...baseProps} />);
    expect(container.querySelector('.alert-row')).to.not.equal(null);
    expect(container.querySelector('.alert-row-title').textContent).to.equal(
      'Service alert',
    );
  });

  it('should call toggleDetails with the alert id when clicked', () => {
    let clickedId;
    const { container } = renderWithProviders(
      <Disruption
        {...baseProps}
        toggleDetails={id => {
          clickedId = id;
        }}
      />,
    );
    container.querySelector('.alert-row-arrow').click();
    expect(clickedId).to.equal('alert1');
  });
});
