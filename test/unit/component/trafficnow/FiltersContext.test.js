import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import {
  FilterContextProvider,
  useFilterContext,
} from '../../../../app/component/trafficnow/filters/FiltersContext';

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
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  describe('Default filter state', () => {
    it('initialises noEffect to NO_EFFECT', () => {
      const controlRef = React.createRef();
      wrapper = mount(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );
      expect(controlRef.current.selectedFilters.noEffect).toBe('NO_EFFECT');
    });

    it('initialises validityPeriod to ALL', () => {
      const controlRef = React.createRef();
      wrapper = mount(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );
      expect(controlRef.current.selectedFilters.validityPeriod).toBe('ALL');
    });

    it('initialises vehicleModes to an empty array', () => {
      const controlRef = React.createRef();
      wrapper = mount(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );
      expect(controlRef.current.selectedFilters.vehicleModes).toEqual([]);
    });

    it('initialises now as a number', () => {
      const controlRef = React.createRef();
      wrapper = mount(
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
      wrapper = mount(
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
      wrapper = mount(
        <FilterContextProvider>
          <FilterConsumer controlRef={controlRef} />
        </FilterContextProvider>,
      );

      act(() => {
        controlRef.current.setFilter('vehicleModes', ['RAIL']);
      });

      expect(controlRef.current.selectedFilters.noEffect).toBe('NO_EFFECT');
    });
  });

  describe('removeFilter', () => {
    it('removes the specified key from selectedFilters', () => {
      const controlRef = React.createRef();
      wrapper = mount(
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
      wrapper = mount(
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
      wrapper = mount(
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
      expect(() => mount(<OutsideConsumer />)).toThrow(
        'useFilterContext must be used within a FilterContextProvider',
      );
    });
  });
});
