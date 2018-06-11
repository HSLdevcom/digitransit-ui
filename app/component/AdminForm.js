import PropTypes from 'prop-types';
import React from 'react';
import { getRoutingSettings } from '../store/localStorage';
import SaveRoutingSettingsButton from './SaveRoutingSettingsButton';
import Loading from './Loading';

class AdminForm extends React.Component {
    renderLoading() {
      return (
        <div className="page-frame fullscreen momentum-scroll">
          <Loading />
        </div>
      );
    }
    
    renderForm() {
      const { router, dataConDefaults } = this.props;
      const location = router.location;
      const OTPDefaults = {
        ignoreRealtimeUpdates: false,
        maxPreTransitTime: 1800,
        walkOnStreetReluctance: 1.0,
        waitReluctance: 1.0,
        bikeSpeed: 5.0,
        bikeSwitchTime: 0,
        bikeSwitchCost: 0,
        bikeBoardCost: 600,
        carParkCarLegWeight: 1,
        maxTransfers: 2,
        waitAtBeginningFactor: 0.4,
        heuristicStepsPerMainStep: 8,
      };
  
      const defaultRoutingSettings = {
        ...OTPDefaults,
        ...dataConDefaults,
      };
  
      const merged = {
        ...defaultRoutingSettings,
        ...getRoutingSettings(),
        ...location.query,
      };
  
      const mergedCurrent = {
        ...defaultRoutingSettings,
        ...getRoutingSettings(),
      };
  
      const updateSelectParam = (param, target) => {
        const newValue = target.value;
        router.replace({
          pathname: location.pathname,
          query: {
            ...location.query,
            [param]: newValue,
          },
        });
      };
  
      const updateInputParam = (param, target, min) => {
        const newValue = target.value;
        if (newValue < min) {
          alert(`Insert a number that is greater than or equal to ${min}`);
          target.value = mergedCurrent[param];
        }
        router.replace({
          pathname: location.pathname,
          query: {
            ...location.query,
            [param]: newValue,
          }
        })
      };
  
      return (
        <div className="page-frame fullscreen momentum-scroll">
          <label>
            Ignore realtime updates (default false):
            <select
              value={merged.ignoreRealtimeUpdates}
              onChange={(e) => updateSelectParam('ignoreRealtimeUpdates', e.target)}
            >
              <option value="false">
                false
              </option>
              <option value="true">
                true
              </option>
            </select>
          </label>
          <label>
            Soft limit for maximum time in seconds before car parking (default {defaultRoutingSettings.maxPreTransitTime})
            <input type="number" step="1" min="0" onInput={(e) => updateInputParam('maxPreTransitTime', e.target, 0)} onChange={(e) => updateInputParam('maxPreTransitTime', e.target, 0)} value={merged.maxPreTransitTime}/>
          </label>
          <label>
            Multiplier for reluctancy to walk on streets where car traffic is allowed. If value is over 1, streets with no cars will be preferred. If under 1, vice versa. (default {defaultRoutingSettings.walkOnStreetReluctance})
            <input type="number" step="any" min="0" onInput={(e) => updateInputParam('walkOnStreetReluctance', e.target, 0)} onChange={(e) => updateInputParam('walkOnStreetReluctance', e.target, 0)} value={merged.walkOnStreetReluctance}/>
          </label>
          <label>
            Multiplier for reluctancy to wait at a transit stop compared to being on a transit vehicle. If value is over 1, extra time is rather spent on a transit vehicle than at a transit stop. If under 1, vice versa. Note, changing this value to be over 1.0 has a side effect where you are guided to walk along the bus line instead of waiting. (default {defaultRoutingSettings.waitReluctance})
            <input type="number" step="any" min="0" onInput={(e) => updateInputParam('waitReluctance', e.target, 0)} onChange={(e) => updateInputParam('waitReluctance', e.target, 0)} value={merged.waitReluctance}/>
          </label>
          <label>
            Bike speed m/s (default {defaultRoutingSettings.bikeSpeed})
            <input type="number" step="any" min="0"onInput={(e) => updateInputParam('bikeSpeed', e.target, 0)} onChange={(e) => updateInputParam('bikeSpeed', e.target, 0)} value={merged.bikeSpeed}/>
          </label>
          <label>
            How long it takes to unpark a bike and get on it or to get off a bike and park it in seconds. (default {defaultRoutingSettings.bikeSwitchTime}).
            <input type="number" step="1" min="0" onInput={(e) => updateInputParam('bikeSwitchTime', e.target, 0)} onChange={(e) => updateInputParam('bikeSwitchTime', e.target, 0)} value={merged.bikeSwitchTime}/>
          </label>
          <label>
            What is the cost to unpark a bike and get on it or to get off a bike and park it. (default {defaultRoutingSettings.bikeSwitchCost}).
            <input type="number" step="1" min="0" onInput={(e) => updateInputParam('bikeSwitchCost', e.target, 0)} onChange={(e) => updateInputParam('bikeSwitchCost', e.target, 0)} value={merged.bikeSwitchCost}/>
          </label>
          <label>
            Cost for boarding a vehicle with a bicycle. (default {defaultRoutingSettings.bikeBoardCost}).
            <input type="number" step="1" min="0" onInput={(e) => updateInputParam('bikeBoardCost', e.target, 0)} onChange={(e) => updateInputParam('bikeBoardCost', e.target, 0)} value={merged.bikeBoardCost}/>
          </label>
          <label>
            Cost for car travels. Increase this value to make car trips shorter. (default {defaultRoutingSettings.carParkCarLegWeight}).
            <input type="number" step="any" min="0" onInput={(e) => updateInputParam('carParkCarLegWeight', e.target, 0)} onChange={(e) => updateInputParam('carParkCarLegWeight', e.target, 0)} value={merged.carParkCarLegWeight}/>
          </label>
          <label>
            Maximum number of transfers. (default {defaultRoutingSettings.maxTransfers}).
            <input type="number" step="1" min="0" onInput={(e) => updateInputParam('maxTransfers', e.target, 0)} onChange={(e) => updateInputParam('maxTransfers', e.target, 0)} value={merged.maxTransfers}/>
          </label>
          <label>
            Multiplier for reluctancy to wait at the start of the trip compared to other legs. If value is under 1, waiting before the first transit trip is less bad than for the rest of the legs. If over 1, vice versa. (default {defaultRoutingSettings.waitAtBeginningFactor}).
            <input type="number" step="any" min="0" onInput={(e) => updateInputParam('waitAtBeginningFactor', e.target, 0)} onChange={(e) => updateInputParam('waitAtBeginningFactor', e.target, 0)} value={merged.waitAtBeginningFactor}/>
          </label>
          <label>
            The number of heuristic steps per main step when using interleaved bidirectional heuristics. (default {defaultRoutingSettings.heuristicStepsPerMainStep}).
            <input type="number" step="1" min="0" onInput={(e) => updateInputParam('heuristicStepsPerMainStep', e.target, 0)} onChange={(e) => updateInputParam('heuristicStepsPerMainStep', e.target, 0)} value={merged.heuristicStepsPerMainStep}/>
          </label>
          <label>
            The number of heuristic steps per main step when using interleaved bidirectional heuristics. (default {defaultRoutingSettings.heuristicStepsPerMainStep}).
            <input type="number" step="1" min="0" onInput={(e) => updateInputParam('heuristicStepsPerMainStep', e.target, 0)} onChange={(e) => updateInputParam('heuristicStepsPerMainStep', e.target, 0)} value={merged.heuristicStepsPerMainStep}/>
          </label>
          <SaveRoutingSettingsButton />
        </div>
      );
    }
  
    render() {
      if (this.props.loading) {
        return this.renderLoading();
      } else {
        return this.renderForm();
      }
    }
  };

  export default AdminForm;
