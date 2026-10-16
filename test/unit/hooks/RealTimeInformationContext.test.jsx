import React from 'react';
import { act, render } from '@testing-library/react';
import {
  RealTimeInformationProvider,
  useRealTimeInformation,
} from '../../../app/hooks/RealTimeInformationContext';
import * as mqttClient from '../../../utils/client/mqttClient';
import events from '../../../utils/client/events';

const wrapper = RealTimeInformationProvider;

function renderHook(hook, { wrapper: Wrapper }) {
  const result = {};
  function Consumer() {
    result.current = hook();
    return null;
  }
  return {
    result,
    ...render(
      <Wrapper>
        <Consumer />
      </Wrapper>,
    ),
  };
}

describe('RealTimeInformationProvider', () => {
  let startMqttClient;
  let changeTopics;

  beforeEach(() => {
    vi.useFakeTimers();
    startMqttClient = vi.spyOn(mqttClient, 'startMqttClient');
    changeTopics = vi
      .spyOn(mqttClient, 'changeTopics')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('publishes the first message immediately and buffers subsequent messages', () => {
    const { result } = renderHook(useRealTimeInformation, { wrapper });
    const { actions } = result.current;
    act(() => actions.handleMessage({ id: 'one', lat: 1 }));
    const firstSnapshot = result.current.vehicles;
    expect(firstSnapshot.one.receivedAt).toBe(Math.floor(Date.now() / 1000));
    act(() => actions.handleMessage([{ id: 'one', lat: 2 }, { id: 'two' }]));
    expect(result.current.vehicles).toBe(firstSnapshot);
    expect(actions.getVehicle('one').lat).toBe(2);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.vehicles.one.lat).toBe(2);
    expect(result.current.vehicles.two.id).toBe('two');
    expect(firstSnapshot.one.lat).toBe(1);
  });

  it('prunes vehicles on topic changes and rejects messages from old routes', () => {
    const { result } = renderHook(useRealTimeInformation, { wrapper });
    const { actions } = result.current;
    act(() =>
      actions.handleMessage([
        { id: 'one', route: 'HSL:1' },
        { id: 'two', route: 'HSL:2' },
      ]),
    );
    act(() =>
      actions.setTopics({
        topics: ['route/1'],
        topicsByRoute: { 1: 'route/1' },
      }),
    );
    expect(Object.keys(result.current.vehicles)).toEqual(['one']);
    act(() => actions.handleMessage({ id: 'two', route: 'HSL:2' }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(Object.keys(result.current.vehicles)).toEqual(['one']);
  });

  it('filters trip topics and emits only visible vehicles without mutating snapshots', () => {
    const { result } = renderHook(useRealTimeInformation, { wrapper });
    const { actions } = result.current;
    const emit = vi.spyOn(events, 'emit');
    act(() =>
      actions.handleMessage([
        { id: 'one', tripId: 'HSL:trip1' },
        { id: 'two', tripId: 'HSL:trip2' },
      ]),
    );
    act(() => actions.setTopics({ topics: ['trip/trip1'] }));
    const snapshot = result.current.vehicles;
    actions.setVisibleVehicles(['one']);
    expect(emit).toHaveBeenCalledWith('vehiclesChanged', [
      expect.objectContaining({ id: 'one', visible: true }),
    ]);
    expect(snapshot.one.visible).toBeUndefined();
    expect(Object.keys(snapshot)).toEqual(['one']);
  });

  it('owns the client lifecycle and topic changes', async () => {
    const client = { end: vi.fn() };
    startMqttClient.mockResolvedValue({ client, topics: ['old'] });
    const { result, unmount } = renderHook(useRealTimeInformation, { wrapper });
    const { actions } = result.current;
    await act(() => actions.start({ mqtt: 'url' }));
    expect(actions.client).toBe(client);
    expect(actions.topics).toEqual(['old']);
    actions.changeTopics({ client, oldTopics: actions.topics, options: [] });
    expect(changeTopics).toHaveBeenCalledWith(
      expect.objectContaining({ client }),
      actions.setTopics,
    );
    act(() => actions.handleMessage({ id: 'one' }));
    act(() => actions.handleMessage({ id: 'two' }));
    unmount();
    expect(client.end).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('discards connections and messages that resolve after stopping', async () => {
    let resolve;
    const client = { end: vi.fn() };
    startMqttClient.mockImplementation(
      () =>
        new Promise(done => {
          resolve = done;
        }),
    );
    const { result } = renderHook(useRealTimeInformation, { wrapper });
    let started;
    act(() => {
      started = result.current.actions.start({});
    });
    const onMessage = startMqttClient.mock.calls[0][1];
    act(() => result.current.actions.stop());
    await act(async () => {
      resolve({ client, topics: [] });
      await started;
    });
    act(() => onMessage({ id: 'stale' }));
    expect(client.end).toHaveBeenCalledTimes(1);
    expect(result.current.actions.client).toBeUndefined();
    expect(result.current.vehicles).toEqual({});
  });

  it('keeps the newest connection when starts resolve out of order', async () => {
    const resolvers = [];
    startMqttClient.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvers.push(resolve);
        }),
    );
    const { result } = renderHook(useRealTimeInformation, { wrapper });
    const { actions } = result.current;
    const oldClient = { end: vi.fn() };
    const newClient = { end: vi.fn() };
    let first;
    let second;
    act(() => {
      first = actions.start({ mqtt: 'old' });
      second = actions.start({ mqtt: 'new' });
    });
    await act(async () => {
      resolvers[1]({ client: newClient, topics: ['new'] });
      await second;
      resolvers[0]({ client: oldClient, topics: ['old'] });
      await first;
    });
    expect(actions.client).toBe(newClient);
    expect(actions.topics).toEqual(['new']);
    expect(oldClient.end).toHaveBeenCalledTimes(1);
    expect(newClient.end).not.toHaveBeenCalled();
    act(() => startMqttClient.mock.calls[0][1]({ id: 'old' }));
    expect(result.current.vehicles).toEqual({});
  });

  it('closes an established client when replacing it and clears buffered updates', async () => {
    const firstClient = { end: vi.fn() };
    const secondClient = { end: vi.fn() };
    startMqttClient.mockResolvedValueOnce({
      client: firstClient,
      topics: ['first'],
    });
    startMqttClient.mockResolvedValueOnce({
      client: secondClient,
      topics: ['second'],
    });
    const { result } = renderHook(useRealTimeInformation, { wrapper });
    const { actions } = result.current;
    await act(() => actions.start({}));
    act(() => actions.handleMessage({ id: 'one' }));
    act(() => actions.handleMessage({ id: 'two' }));
    await act(() => actions.start({}));
    expect(firstClient.end).toHaveBeenCalledTimes(1);
    expect(actions.client).toBe(secondClient);
    expect(result.current.vehicles).toEqual({});
    expect(vi.getTimerCount()).toBe(0);
    act(() => actions.stop());
    expect(secondClient.end).toHaveBeenCalledTimes(1);
    expect(actions.topics).toBeUndefined();
  });
});
