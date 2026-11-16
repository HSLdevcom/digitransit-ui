import { renderWithProviders } from '../../helpers/mock-providers';
import StopNearYou from '../../../../app/component/nearyou/StopNearYou';
import * as NearYouHeaderModule from '../../../../app/component/nearyou/NearYouHeader';
import * as StopNearYouDepartureRowContainerModule from '../../../../app/component/nearyou/StopNearYouDepartureRowContainer';
import { createTestConfig } from '../../helpers/mock-context';

const NearYouHeaderStub = () => <div className="near-you-header" />;
const DepartureRowsStub = () => <div className="departure-rows" />;

const config = createTestConfig({
  colors: { primary: '#00AFFF', caution: '#dc0451' },
  constantOperationStops: {},
});

const makeAlert = (overrides = {}) => ({
  entities: [{ __typename: 'Stop' }],
  alertHeaderText: 'Stop disruption',
  alertDescriptionText: null,
  alertSeverityLevel: 'WARNING',
  effectiveStartDate: null,
  effectiveEndDate: null,
  ...overrides,
});

const makeStop = (alerts = []) => ({
  gtfsId: 'HSL:1234',
  name: 'Stop',
  vehicleMode: 'BUS',
  locationType: 'STOP',
  alerts,
  stoptimesWithoutPatterns: [],
});

const renderView = alerts =>
  renderWithProviders(
    <StopNearYou
      stop={makeStop(alerts)}
      currentTime={1000}
      relay={{ refetch: vi.fn() }}
      isParentTabActive
    />,
    { config },
  );

describe('<StopNearYou /> alert banner', () => {
  beforeEach(() => {
    vi.spyOn(NearYouHeaderModule, 'default', 'get').mockReturnValue(
      NearYouHeaderStub,
    );
    vi.spyOn(
      StopNearYouDepartureRowContainerModule,
      'default',
      'get',
    ).mockReturnValue(DepartureRowsStub);
  });

  it('shows the banner when the stop has a stop alert', () => {
    const { container } = renderView([makeAlert()]);
    expect(container.querySelector('.alert-container')).not.toBeNull();
    expect(container.querySelector('.alert-text').textContent).toBe(
      'Stop disruption',
    );
  });

  it('hides the banner when the stop has no alerts', () => {
    const { container } = renderView([]);
    expect(container.querySelector('.alert-container')).toBeNull();
  });

  it('hides the banner when the only stop alert has expired', () => {
    const { container } = renderView([
      makeAlert({ effectiveStartDate: 100, effectiveEndDate: 500 }),
    ]);
    expect(container.querySelector('.alert-container')).toBeNull();
  });

  it('shows only the currently valid alert among expired ones', () => {
    const { container } = renderView([
      makeAlert({
        alertHeaderText: 'Expired',
        alertSeverityLevel: 'SEVERE',
        effectiveStartDate: 100,
        effectiveEndDate: 500,
      }),
      makeAlert({
        alertHeaderText: 'Ongoing',
        effectiveStartDate: 900,
        effectiveEndDate: 2000,
      }),
    ]);
    expect(container.querySelector('.alert-text').textContent).toBe('Ongoing');
  });

  it('hides the banner when alerts have no Stop entity', () => {
    const { container } = renderView([
      makeAlert({ entities: [{ __typename: 'Route' }] }),
    ]);
    expect(container.querySelector('.alert-container')).toBeNull();
  });
});
