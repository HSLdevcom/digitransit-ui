import { renderHook } from '@testing-library/react-hooks/dom';
import useAutofetchRelay from '../../../app/component/SummaryPage/hooks/useAutofetchRelay';

const refetchFn = (...args) => {
  const onComplete = args[2];

  // 3rd argument must be a function
  expect(typeof onComplete).to.equal('function');
  console.log("refetchFn");

  // simulate request delay
  setTimeout(onComplete, 10);
};

const MockPlans = {
  empty: {
    itineraries: [],
    nextPageCursor: null,
    previousPageCursor: null,
  },
  query_3: {
    itineraries: [
      { startTime: 100, endTime: 150 },
      { startTime: 200, endTime: 250 },
      { startTime: 300, endTime: 350 },
    ],
    nextPageCursor: 'next-query-3',
    previousPageCursor: 'prev-query-3',
  },
  query_2: {
    itineraries: [
      { startTime: 400, endTime: 450 },
      { startTime: 500, endTime: 550 },
    ],
    nextPageCursor: 'next-query-2',
    previousPageCursor: 'prev-query-2',
  },
  query_5: {
    itineraries: [
      { startTime: 100, endTime: 150 },
      { startTime: 200, endTime: 250 },
      { startTime: 300, endTime: 350 },
      { startTime: 400, endTime: 450 },
      { startTime: 500, endTime: 550 },
    ],
    nextPageCursor: 'next-query-5',
    previousPageCursor: 'prev-query-5',
  },
};

describe('useAutofetchRelay()', () => {
  const mockRelay = { refetch: refetchFn };
  const initialProps = {
    relay: mockRelay,
    queryVars: {},
    plan: MockPlans.empty,
  };
  const NUM_REQUIRE_ITINERARIES = 5;

  it('should initialize without crashing', () => {
    renderHook(() =>
      useAutofetchRelay(mockRelay, {}, {}, undefined, NUM_REQUIRE_ITINERARIES),
    );
  });

  it('should refetch 5 itineraries in 2 parts', async () => {
    const hook = renderHook(
      ({ relay, queryVars, plan }) =>
        useAutofetchRelay(relay, queryVars, plan, undefined, 5),
      {
        initialProps,
      },
    );

    expect(hook.result.current.itineraries.length).to.equal(0);
    // simulate react-relay response
    hook.rerender({
      ...initialProps,
      plan: MockPlans.query_3,
    });
    await hook.waitForNextUpdate();

    expect(hook.result.current.status).to.equal('REFETCHING');
    expect(hook.result.current.itineraries.length).to.equal(3);

    // simulate react-relay response
    hook.rerender({
      ...initialProps,
      plan: MockPlans.query_2,
    });
    await hook.waitForNextUpdate();

    expect(hook.result.current.status).to.equal('COMPLETE');
    expect(hook.result.current.itineraries.length).to.equal(
      NUM_REQUIRE_ITINERARIES,
    );
  });

  it('should complete with 5 itineraries', () => {
    const hook = renderHook(
      ({ relay, queryVars, plan }) =>
        useAutofetchRelay(relay, queryVars, plan, undefined, 5),
      {
        initialProps,
      },
    );

    // simulate react-relay response
    hook.rerender({
      ...initialProps,
      plan: MockPlans.query_5,
    });

    expect(hook.result.current.status).to.equal('COMPLETE');
    expect(hook.result.current.itineraries.length).to.equal(
      NUM_REQUIRE_ITINERARIES,
    );
  });

  it('should compute numItineraries correctly', () => {
    let numItineraries;

    const mockFn = refetchVariablesFn => {
      numItineraries = refetchVariablesFn({}).numItineraries;
    };

    renderHook(
      ({ relay, queryVars, plan }) =>
        useAutofetchRelay(relay, queryVars, plan, undefined, 5),
      {
        initialProps: {
          ...initialProps,
          relay: {
            refetch: mockFn,
          },
        },
      },
    );

    expect(numItineraries).to.equal(5);
  });

  it('should process new results on query props change', () => {
    const hook = renderHook(
      ({ relay, queryVars, plan }) =>
        useAutofetchRelay(relay, queryVars, plan, undefined, 5),
      {
        initialProps,
      },
    );

    expect(hook.result.current.itineraries.length).to.equal(0);

    // simulate react-relay response
    hook.rerender({
      ...initialProps,
      plan: MockPlans.query_5,
    });

    expect(hook.result.current.status).to.equal('COMPLETE');
    expect(hook.result.current.itineraries.length).to.equal(5);

    // simulate react-relay response
    /*    hook.rerender({
      ...initialProps,
      plan: MockPlans.query_2,
    });

    expect(hook.result.current.status).to.equal('COMPLETE');
    expect(hook.result.current.itineraries.length).to.equal(
      NUM_REQUIRE_ITINERARIES,
    );
    */
  });
});
