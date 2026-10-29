import { renderWithProviders } from '../helpers/mock-providers';
import RouteNumber from '../../../app/component/RouteNumber';

describe('<RouteNumber />', () => {
  it('should use an icon based on the mode', () => {
    const props = {
      mode: 'CITYBIKE',
    };
    const { container } = renderWithProviders(<RouteNumber {...props} />);
    expect(container.querySelector('use').getAttribute('xlink:href')).toBe(
      '#icon_citybike',
    );
  });

  it('should use the given icon', () => {
    const props = {
      icon: 'icon_scooter',
      mode: 'CITYBIKE',
    };
    const { container } = renderWithProviders(<RouteNumber {...props} />);
    expect(container.querySelector('use').getAttribute('xlink:href')).toBe(
      '#icon_scooter',
    );
  });

  it('should use the given icon when there is a disruption', () => {
    const props = {
      hasDisruption: true,
      icon: 'icon_scooter',
      mode: 'CITYBIKE',
    };
    const { container } = renderWithProviders(<RouteNumber {...props} />);
    expect(container.querySelector('use').getAttribute('xlink:href')).toBe(
      '#icon_scooter',
    );
  });

  it('should use the given icon when there is a call agency', () => {
    const props = {
      icon: 'icon_scooter',
      isCallAgency: true,
      mode: 'CITYBIKE',
    };
    const { container } = renderWithProviders(<RouteNumber {...props} />);
    expect(container.querySelector('use').getAttribute('xlink:href')).toBe(
      '#icon_scooter',
    );
  });

  describe('alert badge', () => {
    const renderBadge = props =>
      renderWithProviders(<RouteNumber mode="BUS" isTransitLeg {...props} />)
        .container;

    it('should not show a badge without an alert', () => {
      const container = renderBadge();
      expect(container.querySelector('.subicon-caution')).toBeNull();
      expect(container.querySelector('.subicon-info')).toBeNull();
    });

    it.each(['WARNING', 'SEVERE', 'UNKNOWN_SEVERITY'])(
      'should show a caution badge for %s',
      level => {
        const container = renderBadge({ alertSeverityLevel: level });
        expect(container.querySelector('.subicon-caution')).not.toBeNull();
        expect(container.querySelector('.subicon-info')).toBeNull();
      },
    );

    it('should show an info badge for INFO', () => {
      const container = renderBadge({ alertSeverityLevel: 'INFO' });
      expect(container.querySelector('.subicon-info')).not.toBeNull();
      expect(container.querySelector('.subicon-caution')).toBeNull();
    });

    it('should show a badge also when the bar variant is used', () => {
      const container = renderBadge({
        alertSeverityLevel: 'WARNING',
        withBar: true,
        vertical: true,
      });
      expect(container.querySelector('.bar .subicon-caution')).not.toBeNull();
    });
  });
});
