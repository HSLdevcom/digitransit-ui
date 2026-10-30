import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import events from '../../utils/client/events';
import { unixTime } from '../../utils/client/timeUtils';
import { splitGtfsId } from '../../utils/shared/gtfs';
import { startMqttClient, changeTopics } from '../../utils/client/mqttClient';

const RealTimeInformationContext = createContext();
const RealTimeActionsContext = createContext();

export function RealTimeInformationProvider({ children }) {
  const [vehicles, setVehicles] = useState({});
  const state = useRef({ vehicles: {}, generation: 0, active: true });

  const actions = useMemo(() => {
    const { current } = state;
    const publish = () => {
      if (current.active) {
        setVehicles({ ...current.vehicles });
      }
    };
    const clear = () => {
      clearTimeout(current.timer);
      current.timer = undefined;
      current.pending = false;
      current.topics = undefined;
      current.topicsByRoute = undefined;
      current.vehicles = {};
      publish();
    };
    const handleMessage = message => {
      if (!message || !current.active) {
        return;
      }
      const receivedAt = unixTime();
      const messages = Array.isArray(message) ? message : [message];
      messages.forEach(msg => {
        if (
          !current.topicsByRoute ||
          current.topicsByRoute[splitGtfsId(msg.route).entityId]
        ) {
          current.vehicles[msg.id] = { ...msg, receivedAt };
        }
      });
      if (current.timer === undefined) {
        publish();
        current.timer = setTimeout(() => {
          current.timer = undefined;
          if (current.pending) {
            current.pending = false;
            publish();
          }
        }, 1000);
      } else {
        current.pending = true;
      }
    };
    const setTopics = ({ topics, topicsByRoute }) => {
      current.topics = topics;
      current.topicsByRoute = topicsByRoute;
      current.vehicles = Object.fromEntries(
        Object.entries(current.vehicles).filter(([, vehicle]) => {
          const { entityId: routeId } = splitGtfsId(vehicle.route);
          if (topicsByRoute && Object.keys(topicsByRoute).length > 0) {
            return routeId && topicsByRoute[routeId];
          }
          if (Array.isArray(topics) && topics.length > 0) {
            const { entityId: tripId } = splitGtfsId(vehicle.tripId);
            const id = tripId || routeId;
            return id && topics.some(topic => topic.includes(id));
          }
          return true;
        }),
      );
      publish();
    };
    const stop = () => {
      current.generation += 1;
      current.client?.end();
      current.client = undefined;
      clear();
    };
    return {
      get client() {
        return current.client;
      },
      get topics() {
        return current.topics;
      },
      getVehicle: id => current.vehicles[id],
      handleMessage,
      setTopics,
      reset: clear,
      stop,
      start: async settings => {
        current.generation += 1;
        const { generation } = current;
        clear();
        const data = await startMqttClient(settings, message => {
          if (generation === current.generation) {
            handleMessage(message);
          }
        });
        if (!current.active || generation !== current.generation) {
          data.client.end();
          return;
        }
        current.client?.end();
        current.client = data.client;
        current.topics = data.topics;
      },
      changeTopics: settings => changeTopics(settings, setTopics),
      setVisibleVehicles: visibleVehicleKeys => {
        const visibleKeys = new Set(visibleVehicleKeys);
        const projectedVehicles = [];
        Object.entries(current.vehicles).forEach(([key, vehicle]) => {
          const visible = visibleKeys.has(key);
          current.vehicles[key] = { ...vehicle, visible };
          if (visible) {
            projectedVehicles.push(current.vehicles[key]);
          }
        });
        events.emit('vehiclesChanged', projectedVehicles);
      },
    };
  }, []);

  useEffect(() => {
    state.current.active = true;
    return () => {
      state.current.active = false;
      actions.stop();
    };
  }, [actions]);

  const value = useMemo(() => ({ vehicles, actions }), [vehicles, actions]);
  return (
    <RealTimeActionsContext.Provider value={actions}>
      <RealTimeInformationContext.Provider value={value}>
        {children}
      </RealTimeInformationContext.Provider>
    </RealTimeActionsContext.Provider>
  );
}

RealTimeInformationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useRealTimeInformation() {
  const value = useContext(RealTimeInformationContext);
  if (value === undefined) {
    throw new Error(
      'useRealTimeInformation must be used within a RealTimeInformationProvider',
    );
  }
  return value;
}

export function useRealTimeActions() {
  const actions = useContext(RealTimeActionsContext);
  if (actions === undefined) {
    throw new Error(
      'useRealTimeActions must be used within a RealTimeInformationProvider',
    );
  }
  return actions;
}
