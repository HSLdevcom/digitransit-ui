import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import CardHeader from '../../../app/component/CardHeader';
import ExternalLink from '../../../app/component/ExternalLink';

describe('<CardHeader />', () => {
  it('should render the header icon', () => {
    const props = {
      description: 'Ratapihantie',
      headerIcon: <div className="header-icon" />,
      name: 'Pasilan asema',
      stop: {},
    };
    const { container } = renderWithProviders(<CardHeader {...props} />);
    expect(container.querySelectorAll('.header-icon')).to.have.lengthOf(1);
  });
  it('should render the station code', () => {
    const props = {
      description: 'Ratapihantie',
      headerIcon: <div className="header-icon" />,
      name: 'Pasilan asema',
      code: '7528',
      network: 'citybike',
      stop: {},
    };
    const { container } = renderWithProviders(<CardHeader {...props} />);
    expect(
      container.querySelector('.itinerary-stop-code').textContent,
    ).to.equal('7528');
  });
  it('should  render the virtual monitor if so configured', () => {
    const props = {
      description: 'Ratapihantie',
      headerIcon: <div className="header-icon" />,
      name: 'Pasilan asema',
      code: '7528',
      network: 'citybike',
      externalLink: (
        <ExternalLink
          name="Virtual monitor"
          href="http://foo.com/virtualmonitor/HSL:1130181"
        />
      ),
      stop: {},
    };
    const { container } = renderWithProviders(<CardHeader {...props} />);
    expect(
      container.querySelector('.external-link').getAttribute('href'),
    ).to.equal('http://foo.com/virtualmonitor/HSL:1130181');
  });

  it('should not render the virtual monitor if its not passed', () => {
    const props = {
      description: 'Ratapihantie',
      headerIcon: <div className="header-icon" />,
      name: 'Pasilan asema',
      code: '7528',
      network: 'citybike',
      externalLink: null,
      stop: {},
    };
    const { container } = renderWithProviders(<CardHeader {...props} />);
    expect(container.querySelector('a')).to.equal(null);
  });
});
