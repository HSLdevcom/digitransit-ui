import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render, act } from '@testing-library/react';
import {
  FilterContextProvider,
  useFilterContext,
} from '../../../../app/component/trafficnow/filters/FiltersContext';

// React's dev-mode error logging re-dispatches a render error a second time,
// asynchronously, via a simulated DOM event (`invokeGuardedCallbackDev`,
// used to capture a better stack trace) - in addition to the synchronous
// throw the test itself catches with `expect(() => render(...)).toThrow()`.
// jsdom reports that second, event-dispatch-based throw as an uncaught
// script error, which fires a `window` `error` event; Vitest's jsdom
// environment re-emits that as a Node `uncaughtException` if no other
// listener is registered on `window` - printed as a top-level "Error:
// Uncaught [...]" that has nothing to do with `console.error` (so mocking/
// restoring `console.error` around the render call below doesn't silence
// it). Registering our own `error` listener that calls
// `event.preventDefault()` (mirroring what a real page would do) stops it.
const suppressUncaughtError = callback => {
  const onError = event => event.preventDefault();
  window.addEventListener('error', onError);
  try {
    callback();
  } finally {
    window.removeEventListener('error', onError);
  }
};

/**
 * A test consumer component that exposes context state and mutators via
 * a ref so tests can inspect state without reading implementation internals.
 */
const FilterConsumer = ({ controlRef }) => {
  const ctx = useFilterContext();

  useEffect(() => {
    if (controlRef) {
      const ref = controlRef;
      ref.current = ctx;
    }
  });

  return (
    <div
      data-selected-filters={JSON.stringify(ctx.selectedFilters)}
      data-validity-period={ctx.selectedFilters.validityPeriod}
      data-no-effect={ctx.selectedFilters.noEffect}
      data-vehicle-modes={JSON.stringify(ctx.selectedFilters.vehicleModes)}
    />
  );
};

FilterConsumer.propTypes = {
  controlRef: PropTypes.shape({ current: PropTypes.shape({}) }),
};

/**
 * A component that deliberately uses useFilterContext outside a provider to
 * verify that the hook throws.
 */
const OutsideConsumer = () => {
  useFilterContext();
  return <div />;
};

describe('FiltersContext', () => {
  // The repo's global afterEach already calls RTL's cleanup() (unmounting
  // every render), so no manual wrapper/unmount bookkeeping is needed here.

  describe('Default filter state', () => {
    it('initialises noEffect to NO_EFFECT', () => {
      const controlRef = React.createRef();
      render(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );
      expect(controlRef.current.selectedFilters.noEffect).toBe('NO_EFFECT');
    });

    it('initialises validityPeriod to ALL', () => {
      const controlRef = React.createRef();
      render(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );
      expect(controlRef.current.selectedFilters.validityPeriod).toBe('ALL');
    });

    it('initialises vehicleModes to an empty array', () => {
      const controlRef = React.createRef();
      render(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );
      expect(controlRef.current.selectedFilters.vehicleModes).toEqual([]);
    });

    it('initialises now as a number', () => {
      const controlRef = React.createRef();
      render(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );
      expect(typeof controlRef.current.selectedFilters.now).toBe('number');
    });
  });

  describe('setFilter', () => {
    it('updates vehicleModes when setFilter is called', () => {
      const controlRef = React.createRef();
      render(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );

      act(() => {
        controlRef.current.setFilter('vehicleModes', ['BUS']);
      });

      expect(controlRef.current.selectedFilters.vehicleModes).toEqual(['BUS']);
    });

    it('does not affect other filter keys when only one is updated', () => {
      const controlRef = React.createRef();
      render(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );

      act(() => {
        controlRef.current.setFilter('vehicleModes', ['RAIL']);
      });

      // noEffect should be unchanged
      expect(controlRef.current.selectedFilters.noEffect).toBe('NO_EFFECT');
    });
  });

  describe('removeFilter', () => {
    it('removes the specified key from selectedFilters', () => {
      const controlRef = React.createRef();
      render(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );

      act(() => {
        controlRef.current.setFilter('entity', { gtfsId: 'HSL:1' });
      });
      act(() => {
        controlRef.current.removeFilter('entity');
      });

      expect(controlRef.current.selectedFilters).not.toHaveProperty('entity');
    });

    it('leaves other keys intact after removing one', () => {
      const controlRef = React.createRef();
      render(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );

      act(() => {
        controlRef.current.removeFilter('vehicleModes');
      });

      expect(controlRef.current.selectedFilters.noEffect).toBe('NO_EFFECT');
    });
  });

  describe('resetFilters', () => {
    it('restores all filters to their default values', () => {
      const controlRef = React.createRef();
      render(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );

      act(() => {
        controlRef.current.setFilter('vehicleModes', ['BUS', 'RAIL']);
        controlRef.current.setFilter('validityPeriod', 'UPCOMING');
      });
      act(() => {
        controlRef.current.resetFilters();
      });

      expect(controlRef.current.selectedFilters.vehicleModes).toEqual([]);
      expect(controlRef.current.selectedFilters.validityPeriod).toBe('ALL');
      expect(controlRef.current.selectedFilters.noEffect).toBe('NO_EFFECT');
    });
  });

  describe('useFilterContext outside provider', () => {
    it('throws when used outside a FilterContextProvider', () => {
      // React's dev-mode error logging re-reports the render error a second
      // time (asynchronously, via a simulated DOM event) in addition to the
      // synchronous throw below; suppress that duplicate console.error so it
      // doesn't surface as an unhandled exception (the global setup makes
      // console.error throw).
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      suppressUncaughtError(() => {
        expect(() => render(<OutsideConsumer />)).toThrow(
          'useFilterContext must be used within a FilterContextProvider',
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
