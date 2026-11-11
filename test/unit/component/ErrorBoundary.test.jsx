import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import ErrorBoundary from '../../../app/component/ErrorBoundary';

function Broken() {
  throw new Error('broken');
}

const suppressUncaughtError = callback => {
  const onError = event => event.preventDefault();
  window.addEventListener('error', onError);
  try {
    callback();
  } finally {
    window.removeEventListener('error', onError);
  }
};

describe('<ErrorBoundary />', () => {
  beforeEach(() => {
    // React logs caught errors with console.error, which the test setup throws on
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render children when there is no error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <div>content</div>
      </ErrorBoundary>,
    );
    expect(screen.queryByText('content')).not.toBeNull();
  });

  it('should render the error page when a child throws', () => {
    suppressUncaughtError(() =>
      renderWithProviders(
        <ErrorBoundary>
          <Broken />
        </ErrorBoundary>,
      ),
    );
    expect(screen.queryByRole('button')).not.toBeNull();
  });

  it('should render the fallback instead of the error page when given', () => {
    suppressUncaughtError(() =>
      renderWithProviders(
        <ErrorBoundary fallback={<span>fallback</span>}>
          <Broken />
        </ErrorBoundary>,
      ),
    );
    expect(screen.queryByText('fallback')).not.toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('should render the error page when the fallback is null', () => {
    suppressUncaughtError(() =>
      renderWithProviders(
        <ErrorBoundary fallback={null}>
          <Broken />
        </ErrorBoundary>,
      ),
    );
    expect(screen.queryByRole('button')).not.toBeNull();
  });
});
