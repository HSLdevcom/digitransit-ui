import { useEffect, useMemo } from 'react';
import { RouterContext } from 'found';
import { ReactRelayContext } from 'react-relay';
import PropTypes from 'prop-types';
import { IntlProvider, createIntl, createIntlCache } from 'react-intl';
import { render } from '@testing-library/react';
import {
  routerShape,
  matchShape,
  configShape,
  vehicleShape,
} from '../../../src/client/utils/shapes';
import { ConfigProvider } from '../../../src/client/hooks/ConfigContext';
import { MapLayerProvider } from '../../../src/client/hooks/MapLayerContext';
import { PositionProvider } from '../../../src/client/hooks/PositionContext';
import { TimeProvider, TimeContext } from '../../../src/client/hooks/TimeContext';
import {
  RealTimeInformationProvider,
  useRealTimeActions,
} from '../../../src/client/hooks/RealTimeInformationContext';
import translations from '../../../src/client/translations/en';
import { mockContext } from './mock-context';
import { mockRelayEnvironment } from './mock-relay';
import { BreakpointContext } from '../../../src/client/hooks/BreakpointContext';

const defaultMessages = translations.en;
const intlCache = createIntlCache();

/**
 * A real react-intl object for testing code that takes intl as a parameter.
 * Uses the same default en messages as renderWithProviders.
 */
export function createTestIntl({ locale = 'en', messages = defaultMessages } = {}) {
  return createIntl({ locale, messages }, intlCache);
}
const mockRelayContext = { environment: mockRelayEnvironment, variables: {} };

function TestRealTimeVehicles({ vehicles }) {
  const actions = useRealTimeActions();
  useEffect(() => {
    actions.reset();
    actions.handleMessage(Object.values(vehicles));
  }, [actions, vehicles]);
  return null;
}

TestRealTimeVehicles.propTypes = { vehicles: PropTypes.objectOf(vehicleShape).isRequired };

// Wraps the component under test with the intl, config, relay and router
// context providers used by renderWithProviders below.
export default function TestProviders({
  children,
  config,
  match,
  router,
  locale = 'en',
  messages = defaultMessages,
  currentTime,
  breakpoint = 'large',
  vehicles,
}) {
  const routerCtx = useMemo(
    () => ({ match: match || mockContext.match, router: router || mockContext.router }),
    [match, router],
  );
  const inner = (
    <ReactRelayContext.Provider value={mockRelayContext}>
      <RouterContext.Provider value={routerCtx}>
        <BreakpointContext.Provider value={breakpoint}>
          <PositionProvider>
            <RealTimeInformationProvider>
              {vehicles !== undefined && <TestRealTimeVehicles vehicles={vehicles} />}
              {children}
            </RealTimeInformationProvider>
          </PositionProvider>
        </BreakpointContext.Provider>
      </RouterContext.Provider>
    </ReactRelayContext.Provider>
  );
  return (
    <IntlProvider locale={locale} messages={messages}>
      <ConfigProvider value={config || mockContext.config}>
        <MapLayerProvider>
          {currentTime !== undefined ? (
            <TimeContext.Provider value={currentTime}>{inner}</TimeContext.Provider>
          ) : (
            <TimeProvider>{inner}</TimeProvider>
          )}
        </MapLayerProvider>
      </ConfigProvider>
    </IntlProvider>
  );
}

TestProviders.propTypes = {
  children: PropTypes.element.isRequired,
  config: configShape,
  match: matchShape,
  router: routerShape,
  locale: PropTypes.string,
  messages: PropTypes.objectOf(PropTypes.string),
  currentTime: PropTypes.number,
  breakpoint: PropTypes.oneOf(['small', 'medium', 'large']),
  vehicles: PropTypes.objectOf(vehicleShape),
};

/**
 * @param {React.ReactElement} ui - Component under test
 * @param {{ config?: object, match?: object, router?: object, locale?: string, messages?: object, currentTime?: number, breakpoint?: string, vehicles?: object }} opts
 */
export function renderWithProviders(ui, opts = {}) {
  const {
    config = mockContext.config,
    match = mockContext.match,
    router = mockContext.router,
    locale,
    messages,
    currentTime,
    breakpoint,
    vehicles,
    ...renderOpts
  } = opts;
  const Wrapper = ({ children }) => (
    <TestProviders
      config={config}
      match={match}
      router={router}
      locale={locale}
      messages={messages}
      currentTime={currentTime}
      breakpoint={breakpoint}
      vehicles={vehicles}
    >
      {children}
    </TestProviders>
  );
  Wrapper.propTypes = { children: PropTypes.node.isRequired };
  return render(ui, { wrapper: Wrapper, ...renderOpts });
}
