import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Link } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { getRoutingSettings } from '../store/localStorage';
import SaveRoutingSettingsButton from './SaveRoutingSettingsButton';

export const defaultRoutingSettings = {
  ignoreRealtimeUpdates: false,
  maxPreTransitTime: 1800,
  walkOnStreetReluctance: 1.0,
  waitReluctance: 1.0,
  bikeSpeed: 5.0,
  bikeSwitchTime: 0,
  bikeSwitchCost: 0,
  bikeBoardCost: 600,
};

const AdminPage = (context) => {
  const merged = {
    ...defaultRoutingSettings,
    ...getRoutingSettings(),
    ...context.location.query,
  };

  const mergedCurrent = {
    ...defaultRoutingSettings,
    ...getRoutingSettings(),
  };

  const replaceParams = newParams =>
  context.router.replace({
    ...context.location,
    query: {
      ...context.location.query,
      ...newParams,
    },
  });

  const toggleRealtimeUpdates = ({ target }) => {
    const ignoreRealtimeUpdates = target.value;
    context.router.replace({
      pathname: context.location.pathname,
      query: {
        ...context.location.query,
        ignoreRealtimeUpdates,
      },
    });
  };

  const updateMaxPreTransitTime = ({ target }) => {
    const maxPreTransitTime = target.value;
    if (maxPreTransitTime < 0) {
      alert('Insert a positive number');
      target.value = mergedCurrent.maxPreTransitTime;
    }
    context.router.replace({
      pathname: context.location.pathname,
      query: {
        ...context.location.query,
        maxPreTransitTime,
      },
    });
  };

  const updateWalkOnStreetReluctance = ({ target }) => {
    const walkOnStreetReluctance = target.value;
    if (walkOnStreetReluctance < 0) {
      alert('Insert a positive number');
      target.value = mergedCurrent.walkOnStreetReluctance;
    }
    context.router.replace({
      pathname: context.location.pathname,
      query: {
        ...context.location.query,
        walkOnStreetReluctance,
      },
    });
  };

  const updateWaitReluctance = ({ target }) => {
    const waitReluctance = target.value;
    if (waitReluctance < 0) {
      alert('Insert a positive number');
      target.value = mergedCurrent.waitReluctance;
    }
    context.router.replace({
      pathname: context.location.pathname,
      query: {
        ...context.location.query,
        waitReluctance,
      },
    });
  };

  const updateBikeSpeed = ({ target }) => {
    const bikeSpeed = target.value;
    if (bikeSpeed < 0) {
      alert('Insert a positive number');
      target.value = mergedCurrent.bikeSpeed;
    }
    context.router.replace({
      pathname: context.location.pathname,
      query: {
        ...context.location.query,
        bikeSpeed,
      },
    });
  };

  const updateBikeSwitchTime = ({ target }) => {
    const bikeSwitchTime = target.value;
    if (bikeSwitchTime < 0) {
      alert('Insert a positive number');
      target.value = mergedCurrent.bikeSwitchTime;
    }
    context.router.replace({
      pathname: context.location.pathname,
      query: {
        ...context.location.query,
        bikeSwitchTime,
      },
    });
  };

  const updateBikeSwitchCost = ({ target }) => {
    const bikeSwitchCost = target.value;
    if (bikeSwitchCost < 0) {
      alert('Insert a positive number');
      target.value = mergedCurrent.bikeSwitchCost;
    }
    context.router.replace({
      pathname: context.location.pathname,
      query: {
        ...context.location.query,
        bikeSwitchCost,
      },
    });
  };

  const updateBikeBoardCost = ({ target }) => {
    const bikeBoardCost = target.value;
    if (bikeBoardCost < 0) {
      alert('Insert a positive number');
      target.value = mergedCurrent.bikeBoardCost;
    }
    context.router.replace({
      pathname: context.location.pathname,
      query: {
        ...context.location.query,
        bikeBoardCost,
      },
    });
  };

  return (
    <div className="page-frame fullscreen momentum-scroll">
      <label>
        Ignore realtime updates (default false):
        <select
          value={merged.ignoreRealtimeUpdates}
          onChange={toggleRealtimeUpdates}
        >
          <option value="false">
            False
          </option>
          <option value="true">
            True
          </option>
        </select>
      </label>
      <label>
        Soft limit for maximum time in seconds before car parking (default 1800)
        <input type="number" step="1" min="0" onInput={updateMaxPreTransitTime} onChange={updateMaxPreTransitTime} value={merged.maxPreTransitTime}/>
      </label>
      <label>
        Multiplier for reluctancy to walk on streets where car traffic is allowed. If value is over 1, streets with no cars will be preferred. If under 1, vice versa. (default 1.0)
        <input type="number" step="any" min="0" onInput={updateWalkOnStreetReluctance} onChange={updateWalkOnStreetReluctance} value={merged.walkOnStreetReluctance}/>
      </label>
      <label>
        Multiplier for reluctancy to wait at a transit stop compared to being on a transit vehicle. If value is over 1, extra time is rather spent on a transit vehicle than at a transit stop. If under 1, vice versa. Note, changing this value to be over 1.0 has a side effect where you are guided to walk along the bus line instead of waiting. (default 1.0)
        <input type="number" step="any" min="0" onInput={updateWaitReluctance} onChange={updateWaitReluctance} value={merged.waitReluctance}/>
      </label>
      <label>
        Bike speed m/s (default 5.0)
        <input type="number" step="any" min="0" onInput={updateBikeSpeed} onChange={updateBikeSpeed} value={merged.bikeSpeed}/>
      </label>
      <label>
        How long it takes to unpark a bike and get on it or to get off a bike and park it in seconds. (default 0).
        <input type="number" step="1" min="0" onInput={updateBikeSwitchTime} onChange={updateBikeSwitchTime} value={merged.bikeSwitchTime}/>
      </label>
      <label>
        What is the cost to unpark a bike and get on it or to get off a bike and park it. (default 0).
        <input type="number" step="1" min="0" onInput={updateBikeSwitchCost} onChange={updateBikeSwitchCost} value={merged.bikeSwitchCost}/>
      </label>
      <label>
        Cost for boarding a vehicle with a bicycle. (default 600).
        <input type="number" step="1" min="0" onInput={updateBikeBoardCost} onChange={updateBikeBoardCost} value={merged.bikeBoardCost}/>
      </label>
      <SaveRoutingSettingsButton />
    </div>
  );
};

AdminPage.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

AdminPage.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default connectToStores(AdminPage, ['PreferencesStore'], context => ({
  currentLanguage: context.getStore('PreferencesStore').getLanguage(),
}));
