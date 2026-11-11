import { renderWithProviders } from '../helpers/mock-providers';
import { mockMatch } from '../helpers/mock-router';
import TripStopsContainer from '../../../app/component/routepage/TripStopsContainer';

describe('<TripStopsContainer />', () => {
  it('should render empty if trip information is missing', () => {
    const props = {
      breakpoint: 'large',
      routes: [],
      trip: null,
      match: mockMatch,
    };
    const { container } = renderWithProviders(
      <TripStopsContainer {...props} />,
    );
    expect(container.innerHTML).toBe('');
  });
});
