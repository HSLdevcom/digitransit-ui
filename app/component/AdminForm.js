import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'react-router';
import { getRoutingSettings, resetRoutingSettings } from '../store/localStorage';
import RoutingSettingsButtons from './RoutingSettingsButtons';
import Loading from './Loading';

class AdminForm extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
  };

  renderLoading() {
    return (
      <div className="page-frame fullscreen momentum-scroll">
        <Loading />
      </div>
    );
  }
  
  renderForm() {
    const { dataConDefaults } = this.props;
    const location = this.context.router.location;
    const OTPDefaults = {
      ignoreRealtimeUpdates: false,
      maxPreTransitTime: 1800,
      walkOnStreetReluctance: 1.0,
      waitReluctance: 1.0,
      bikeSpeed: 5.0,
      bikeSwitchTime: 0,
      bikeSwitchCost: 0,
      bikeBoardCost: 600,
      optimize: 'QUICK',
      safetyFactor: 0.334,
      slopeFactor: 0.333,
      timeFactor: 0.333,
      carParkCarLegWeight: 1,
      maxTransfers: 2,
      waitAtBeginningFactor: 0.4,
      heuristicStepsPerMainStep: 8,
      compactLegsByReversedSearch: true,
      disableRemainingWeightHeuristic: false,
    };

    const UIDefaults = {
      maxWalkDistance: this.context.config.maxWalkDistance,
      maxBikingDistance: this.context.config.maxBikingDistance,
      itineraryFiltering: this.context.config.itineraryFiltering,
    }

    const defaultRoutingSettings = {
      ...OTPDefaults,
      ...dataConDefaults,
      ...UIDefaults,
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
      this.context.router.replace({
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
      this.context.router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
          [param]: newValue,
        },
      });
    };

    const updateTriangleParam = (param, target) => {
      const newValue = target.value;
      if (newValue < 0) {
        alert(`Insert a number that is greater than or equal to 0`);
        target.value = mergedCurrent[param];
      } else if (newValue > 1) {
        alert(`Insert a number that is greater than or equal to 1`)
        target.value = mergedCurrent[param];
      }
      let currentTriangle = {
        safetyFactor: merged.safetyFactor,
        slopeFactor: merged.slopeFactor,
        timeFactor: merged.timeFactor,
      };
      this.context.router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
          ...currentTriangle,
          [param]: newValue,
        },
      });
    };

    const resetParameters = () => {
      console.log(location.query);
      resetRoutingSettings();
      this.context.router.replace({
        pathname: location.pathname,
        query: {},
      });
    };

    return (
      <div className="page-frame fullscreen momentum-scroll">
        <h3>Explanations for terms:</h3>
        <p>In routing configuration, cost is often equal to the time something takes but if you want to make something less preferred for other reasons than time, you can increase its cost instead of increasing both cost and time. This way the routing results will still have realistic time estimates.</p>
        <p>Soft limit is not the ultimate limit value for something. Instead, it can be surpassed but there will be extra cost for the surpassing amount. For example, soft limit for walk distance does not prevent results where the walk distance is longer than the limit but those should be rare cases as the extra cost makes those longer walks unattractive for the routing engine.</p>
        <label>
          Routing optimization type for cycling. QUICK finds the quickest routes, SAFE prefers routes that are safer and GREENWAYS prefers travel through paths and parks. TRIANGLE allows to configure the emphasis on safety, avoiding slopes and travel time. (default {defaultRoutingSettings.optimize}, parameter name: optimize):
          <select
            value={merged.optimize}
            onChange={(e) => updateSelectParam('optimize', e.target)}
          >
            <option value="QUICK">
              QUICK
            </option>
            <option value="SAFE">
              SAFE
            </option>
            <option value="GREENWAYS">
              GREENWAYS
            </option>
            <option value="TRIANGLE">
              TRIANGLE
            </option>
          </select>
        </label>
        {merged.optimize === 'TRIANGLE' &&
          <React.Fragment>
          <b>The sum of the following three values should equal to 1.0</b>
          <label>
            Relative importance of safety in cycling (default {defaultRoutingSettings.safetyFactor}, parameter name: safetyFactor).
            <input type="number" step="any" min="0" onInput={(e) => updateTriangleParam('safetyFactor', e.target)} onChange={(e) => updateTriangleParam('safetyFactor', e.target)} value={merged.safetyFactor}/>
          </label>
          <label>
            Relative importance of avoiding slopes in cycling. (default {defaultRoutingSettings.slopeFactor}, parameter name: slopeFactor).
            <input type="number" step="any" min="0" onInput={(e) => updateTriangleParam('slopeFactor', e.target)} onChange={(e) => updateTriangleParam('slopeFactor', e.target)} value={merged.slopeFactor}/>
          </label>
          <label>
            Relative importance of travel time optimizatio in cycling. (default {defaultRoutingSettings.timeFactor}, parameter name: timeFactor).
            <input type="number" step="any" min="0" onInput={(e) => updateTriangleParam('timeFactor', e.target)} onChange={(e) => updateTriangleParam('timeFactor', e.target)} value={merged.timeFactor}/>
          </label>
          </React.Fragment>
        }
        <hr />
        <label>
          Soft limit for maximum walking distance in meters (default {defaultRoutingSettings.maxWalkDistance}, parameter name: maxWalkDistance)
          <input type="number" step="any" min="0" onInput={(e) => updateInputParam('maxWalkDistance', e.target, 0)} onChange={(e) => updateInputParam('maxWalkDistance', e.target, 0)} value={merged.maxWalkDistance}/>
        </label>
        <label>
          Soft limit for maximum cycling distance in meters (default {defaultRoutingSettings.maxBikingDistance}, parameter name: maxBikingDistance)
          <input type="number" step="any" min="0" onInput={(e) => updateInputParam('maxBikingDistance', e.target, 0)} onChange={(e) => updateInputParam('maxBikingDistance', e.target, 0)} value={merged.maxBikingDistance}/>
        </label>
        <label>
          Ignore realtime updates (default {defaultRoutingSettings.ignoreRealtimeUpdates.toString()}, parameter name: ignoreRealtimeUpdates):
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
          Soft limit for maximum time in seconds before car parking (default {defaultRoutingSettings.maxPreTransitTime}, parameter name: maxPreTransitTime)
          <input type="number" step="1" min="0" onInput={(e) => updateInputParam('maxPreTransitTime', e.target, 0)} onChange={(e) => updateInputParam('maxPreTransitTime', e.target, 0)} value={merged.maxPreTransitTime}/>
        </label>
        <label>
          Multiplier for reluctancy to walk on streets where car traffic is allowed. If value is over 1, streets with no cars will be preferred. If under 1, vice versa. (default {defaultRoutingSettings.walkOnStreetReluctance}, parameter name: walkOnStreetReluctance)
          <input type="number" step="any" min="0" onInput={(e) => updateInputParam('walkOnStreetReluctance', e.target, 0)} onChange={(e) => updateInputParam('walkOnStreetReluctance', e.target, 0)} value={merged.walkOnStreetReluctance}/>
        </label>
        <label>
          Multiplier for reluctancy to wait at a transit stop compared to being on a transit vehicle. If value is over 1, extra time is rather spent on a transit vehicle than at a transit stop. If under 1, vice versa. Note, changing this value to be over 1.0 has a side effect where you are guided to walk along the bus line instead of waiting. (default {defaultRoutingSettings.waitReluctance}, parameter name: waitReluctance)
          <input type="number" step="any" min="0" onInput={(e) => updateInputParam('waitReluctance', e.target, 0)} onChange={(e) => updateInputParam('waitReluctance', e.target, 0)} value={merged.waitReluctance}/>
        </label>
        <label>
          Bike speed m/s (default {defaultRoutingSettings.bikeSpeed}, parameter name: bikeSpeed)
          <input type="number" step="any" min="0"onInput={(e) => updateInputParam('bikeSpeed', e.target, 0)} onChange={(e) => updateInputParam('bikeSpeed', e.target, 0)} value={merged.bikeSpeed}/>
        </label>
        <label>
          How long it takes to unpark a bike and get on it or to get off a bike and park it in seconds. (default {defaultRoutingSettings.bikeSwitchTime}, parameter name: bikeSwitchTime).
          <input type="number" step="1" min="0" onInput={(e) => updateInputParam('bikeSwitchTime', e.target, 0)} onChange={(e) => updateInputParam('bikeSwitchTime', e.target, 0)} value={merged.bikeSwitchTime}/>
        </label>
        <label>
          What is the cost to unpark a bike and get on it or to get off a bike and park it. (default {defaultRoutingSettings.bikeSwitchCost}, parameter name: bikeSwitchCost).
          <input type="number" step="1" min="0" onInput={(e) => updateInputParam('bikeSwitchCost', e.target, 0)} onChange={(e) => updateInputParam('bikeSwitchCost', e.target, 0)} value={merged.bikeSwitchCost}/>
        </label>
        <label>
          Cost for boarding a vehicle with a bicycle. (default {defaultRoutingSettings.bikeBoardCost}, parameter name: bikeBoardCost).
          <input type="number" step="1" min="0" onInput={(e) => updateInputParam('bikeBoardCost', e.target, 0)} onChange={(e) => updateInputParam('bikeBoardCost', e.target, 0)} value={merged.bikeBoardCost}/>
        </label>
        <label>
          Cost for car travels. Increase this value to make car trips shorter. (default {defaultRoutingSettings.carParkCarLegWeight}, parameter name: carParkCarLegWeight).
          <input type="number" step="any" min="0" onInput={(e) => updateInputParam('carParkCarLegWeight', e.target, 0)} onChange={(e) => updateInputParam('carParkCarLegWeight', e.target, 0)} value={merged.carParkCarLegWeight}/>
        </label>
        <label>
          Maximum number of transfers. (default {defaultRoutingSettings.maxTransfers}, parameter name: maxTransfers).
          <input type="number" step="1" min="0" onInput={(e) => updateInputParam('maxTransfers', e.target, 0)} onChange={(e) => updateInputParam('maxTransfers', e.target, 0)} value={merged.maxTransfers}/>
        </label>
        <label>
          Multiplier for reluctancy to wait at the start of the trip compared to other legs. If value is under 1, waiting before the first transit trip is less bad than for the rest of the legs. If over 1, vice versa. (default {defaultRoutingSettings.waitAtBeginningFactor}, parameter name: waitAtBeginningFactor).
          <input type="number" step="any" min="0" onInput={(e) => updateInputParam('waitAtBeginningFactor', e.target, 0)} onChange={(e) => updateInputParam('waitAtBeginningFactor', e.target, 0)} value={merged.waitAtBeginningFactor}/>
        </label>
        <label>
          The number of heuristic steps per main step when using interleaved bidirectional heuristics. (default {defaultRoutingSettings.heuristicStepsPerMainStep}, parameter name: heuristicStepsPerMainStep).
          <input type="number" step="1" min="0" onInput={(e) => updateInputParam('heuristicStepsPerMainStep', e.target, 0)} onChange={(e) => updateInputParam('heuristicStepsPerMainStep', e.target, 0)} value={merged.heuristicStepsPerMainStep}/>
        </label>
        <label>
          When true, do a full reversed search to compact the legs of the GraphPath. It can remove pointless wait at transit stops at performance cost (default {defaultRoutingSettings.compactLegsByReversedSearch.toString()}, parameter name: compactLegsByReversedSearch):
          <select
            value={merged.compactLegsByReversedSearch}
            onChange={(e) => updateSelectParam('compactLegsByReversedSearch', e.target)}
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
          When true, routing uses Dijkstra's algorithm instead of default A* algorithm. When citybike is selected as one of the available travel modes, this parameter is true regardless of what is selected here (default {defaultRoutingSettings.disableRemainingWeightHeuristic.toString()}, parameter name: disableRemainingWeightHeuristic):
          <select
            value={merged.disableRemainingWeightHeuristic}
            onChange={(e) => updateSelectParam('disableRemainingWeightHeuristic', e.target)}
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
          How easily bad itineraries are filtered. Value 0 disables filtering. The higher the value, the easier less good routes get filtered from response. Recommended value range is 0.2 - 5. Value 1 means that if an itinerary is twice as worse than another one in some respect (say 100% more walking), it will be filtered. Value 0.5 filters 200% worse itineraries and value 2 defines 50% filtering level. Value 5 filters 20% worse routes. (default {defaultRoutingSettings.itineraryFiltering}, parameter name: itineraryFiltering).
          <input type="number" step="any" min="0" onInput={(e) => updateInputParam('itineraryFiltering', e.target, 0)} onChange={(e) => updateInputParam('itineraryFiltering', e.target, 0)} value={merged.itineraryFiltering}/>
        </label>
        <RoutingSettingsButtons onReset={resetParameters} />
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
