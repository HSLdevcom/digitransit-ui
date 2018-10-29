import PropTypes from 'prop-types';
import React from 'react';

import { routerShape } from 'react-router';
import {
  getRoutingSettings,
  resetRoutingSettings,
} from '../store/localStorage';
import RoutingSettingsButtons from './RoutingSettingsButtons';
import Loading from './Loading';

class AdminForm extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
  };

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    dataConDefaults: PropTypes.object.isRequired,
    modeWeightDefaults: PropTypes.object.isRequired,
  };

  renderForm() {
    const { dataConDefaults, modeWeightDefaults } = this.props;
    const { location } = this.context.router;
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
      busWeight: 1.0,
      railWeight: 1.0,
      subwayWeight: 1.0,
      tramWeight: 1.0,
      ferryWeight: 1.0,
      airplaneWeight: 1.0,
    };

    const UIDefaults = {
      maxWalkDistance: this.context.config.maxWalkDistance,
      maxBikingDistance: this.context.config.maxBikingDistance,
      itineraryFiltering: this.context.config.itineraryFiltering,
    };

    const defaultRoutingSettings = {
      ...OTPDefaults,
      ...dataConDefaults,
      ...modeWeightDefaults,
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

    const updateOptimize = (param, target) => {
      const newValue = target.value;
      const currentTriangle =
        newValue === 'TRIANGLE'
          ? {
              safetyFactor: merged.safetyFactor,
              slopeFactor: merged.slopeFactor,
              timeFactor: merged.timeFactor,
            }
          : {};
      this.context.router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
          ...currentTriangle,
          [param]: newValue,
        },
      });
    };

    const updateInputParam = (param, target, min) => {
      let newValue = target.value;
      if (newValue < min) {
        alert(`Insert a number that is greater than or equal to ${min}`);
        newValue = mergedCurrent[param];
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
      let newValue = target.value;
      if (newValue < 0) {
        alert(`Insert a number that is greater than or equal to 0`);
        newValue = mergedCurrent[param];
      } else if (newValue > 1) {
        alert(`Insert a number that is greater than or equal to 1`);
        newValue = mergedCurrent[param];
      }
      this.context.router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
          [param]: newValue,
        },
      });
    };

    const resetParameters = () => {
      resetRoutingSettings();
      this.context.router.replace({
        pathname: location.pathname,
        query: {},
      });
    };

    return (
      <div className="page-frame fullscreen momentum-scroll">
        <h3>Explanations for terms:</h3>
        <p>
          In routing configuration, cost is often equal to the time something
          takes but if you want to make something less preferred for other
          reasons than time, you can increase its cost instead of increasing
          both cost and time. This way the routing results will still have
          realistic time estimates.
        </p>
        <p>
          Soft limit is not the ultimate limit value for something. Instead, it
          can be surpassed but there will be extra cost for the surpassing
          amount. For example, soft limit for walk distance does not prevent
          results where the walk distance is longer than the limit but those
          should be rare cases as the extra cost makes those longer walks
          unattractive for the routing engine.
        </p>
        <label htmlFor="optimize">
          Routing optimization type for cycling. QUICK finds the quickest
          routes, SAFE prefers routes that are safer, GREENWAYS prefers travel
          through bicycle routes and trails, and FLAT prefers the least amount
          of vertical changes. TRIANGLE allows to configure the emphasis on
          safety, avoiding slopes and travel time. (default{' '}
          {defaultRoutingSettings.optimize}, parameter name: optimize).
          <select
            value={merged.optimize}
            onChange={e => updateOptimize('optimize', e.target)}
          >
            <option value="QUICK">QUICK</option>
            <option value="SAFE">SAFE</option>
            <option value="GREENWAYS">GREENWAYS</option>
            <option value="TRIANGLE">TRIANGLE</option>
            <option value="FLAT">FLAT</option>
          </select>
        </label>
        {merged.optimize === 'TRIANGLE' && (
          <React.Fragment>
            <b>The sum of the following three values should equal to 1.0</b>
            <label htmlFor="safetyFactor">
              Relative importance of safety in cycling (default{' '}
              {defaultRoutingSettings.safetyFactor}, parameter name:
              safetyFactor).
              <input
                type="number"
                step="any"
                min="0"
                onChange={e => updateTriangleParam('safetyFactor', e.target)}
                value={merged.safetyFactor}
              />
            </label>
            <label htmlFor="slopeFactor">
              Relative importance of avoiding slopes in cycling. (default{' '}
              {defaultRoutingSettings.slopeFactor}, parameter name:
              slopeFactor).
              <input
                type="number"
                step="any"
                min="0"
                onChange={e => updateTriangleParam('slopeFactor', e.target)}
                value={merged.slopeFactor}
              />
            </label>
            <label htmlFor="timeFactor">
              Relative importance of travel time optimizatio in cycling.
              (default {defaultRoutingSettings.timeFactor}, parameter name:
              timeFactor).
              <input
                type="number"
                step="any"
                min="0"
                onChange={e => updateTriangleParam('timeFactor', e.target)}
                value={merged.timeFactor}
              />
            </label>
          </React.Fragment>
        )}
        <hr />
        <label htmlFor="maxWalkDistance">
          Soft limit for maximum walking distance in meters (default{' '}
          {defaultRoutingSettings.maxWalkDistance}, parameter name:
          maxWalkDistance)
          <input
            type="number"
            step="any"
            min="0"
            onChange={e => updateInputParam('maxWalkDistance', e.target, 0)}
            value={merged.maxWalkDistance}
          />
        </label>
        <label htmlFor="maxBikingDistance">
          Soft limit for maximum cycling distance in meters (default{' '}
          {defaultRoutingSettings.maxBikingDistance}, parameter name:
          maxBikingDistance)
          <input
            type="number"
            step="any"
            min="0"
            onChange={e => updateInputParam('maxBikingDistance', e.target, 0)}
            value={merged.maxBikingDistance}
          />
        </label>
        <label htmlFor="ignoreRealtimeUpdates">
          Ignore realtime updates (default{' '}
          {defaultRoutingSettings.ignoreRealtimeUpdates.toString()}, parameter
          name: ignoreRealtimeUpdates):
          <select
            value={merged.ignoreRealtimeUpdates}
            onChange={e => updateSelectParam('ignoreRealtimeUpdates', e.target)}
          >
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        </label>
        <label htmlFor="maxPreTransitTime">
          Soft limit for maximum time in seconds before car parking (default{' '}
          {defaultRoutingSettings.maxPreTransitTime}, parameter name:
          maxPreTransitTime)
          <input
            type="number"
            step="1"
            min="0"
            onChange={e => updateInputParam('maxPreTransitTime', e.target, 0)}
            value={merged.maxPreTransitTime}
          />
        </label>
        <label htmlFor="walkOnStreetReluctance">
          Multiplier for reluctancy to walk on streets where car traffic is
          allowed. If value is over 1, streets with no cars will be preferred.
          If under 1, vice versa. (default{' '}
          {defaultRoutingSettings.walkOnStreetReluctance}, parameter name:
          walkOnStreetReluctance)
          <input
            type="number"
            step="any"
            min="0"
            onChange={e =>
              updateInputParam('walkOnStreetReluctance', e.target, 0)
            }
            value={merged.walkOnStreetReluctance}
          />
        </label>
        <label htmlFor="waitReluctance">
          Multiplier for reluctancy to wait at a transit stop compared to being
          on a transit vehicle. If value is over 1, extra time is rather spent
          on a transit vehicle than at a transit stop. If under 1, vice versa.
          Note, changing this value to be over 1.0 has a side effect where you
          are guided to walk along the bus line instead of waiting. (default{' '}
          {defaultRoutingSettings.waitReluctance}, parameter name:
          waitReluctance)
          <input
            type="number"
            step="any"
            min="0"
            onChange={e => updateInputParam('waitReluctance', e.target, 0)}
            value={merged.waitReluctance}
          />
        </label>
        <label htmlFor="bikeSpeed">
          Bike speed m/s (default {defaultRoutingSettings.bikeSpeed}, parameter
          name: bikeSpeed)
          <input
            type="number"
            step="any"
            min="0"
            onChange={e => updateInputParam('bikeSpeed', e.target, 0)}
            value={merged.bikeSpeed}
          />
        </label>
        <label htmlFor="bikeSwitchTime">
          How long it takes to unpark a bike and get on it or to get off a bike
          and park it in seconds. (default{' '}
          {defaultRoutingSettings.bikeSwitchTime}, parameter name:
          bikeSwitchTime).
          <input
            type="number"
            step="1"
            min="0"
            onChange={e => updateInputParam('bikeSwitchTime', e.target, 0)}
            value={merged.bikeSwitchTime}
          />
        </label>
        <label htmlFor="bikeSwitchCost">
          What is the cost to unpark a bike and get on it or to get off a bike
          and park it. (default {defaultRoutingSettings.bikeSwitchCost},
          parameter name: bikeSwitchCost).
          <input
            type="number"
            step="1"
            min="0"
            onChange={e => updateInputParam('bikeSwitchCost', e.target, 0)}
            value={merged.bikeSwitchCost}
          />
        </label>
        <label htmlFor="bikeBoardCost">
          Cost for boarding a vehicle with a bicycle. (default{' '}
          {defaultRoutingSettings.bikeBoardCost}, parameter name:
          bikeBoardCost).
          <input
            type="number"
            step="1"
            min="0"
            onChange={e => updateInputParam('bikeBoardCost', e.target, 0)}
            value={merged.bikeBoardCost}
          />
        </label>
        <label htmlFor="carParkCarLegWeight">
          Cost for car travels. Increase this value to make car trips shorter.
          (default {defaultRoutingSettings.carParkCarLegWeight}, parameter name:
          carParkCarLegWeight).
          <input
            type="number"
            step="any"
            min="0"
            onChange={e => updateInputParam('carParkCarLegWeight', e.target, 0)}
            value={merged.carParkCarLegWeight}
          />
        </label>
        <label htmlFor="maxTransfers">
          Maximum number of transfers. (default{' '}
          {defaultRoutingSettings.maxTransfers}, parameter name: maxTransfers).
          <input
            type="number"
            step="1"
            min="0"
            onChange={e => updateInputParam('maxTransfers', e.target, 0)}
            value={merged.maxTransfers}
          />
        </label>
        <label htmlFor="waitAtBeginningFactor">
          Multiplier for reluctancy to wait at the start of the trip compared to
          other legs. If value is under 1, waiting before the first transit trip
          is less bad than for the rest of the legs. If over 1, vice versa.
          (default {defaultRoutingSettings.waitAtBeginningFactor}, parameter
          name: waitAtBeginningFactor).
          <input
            type="number"
            step="any"
            min="0"
            onChange={e =>
              updateInputParam('waitAtBeginningFactor', e.target, 0)
            }
            value={merged.waitAtBeginningFactor}
          />
        </label>
        <label htmlFor="heuristicStepsPerMainStep">
          The number of heuristic steps per main step when using interleaved
          bidirectional heuristics. (default{' '}
          {defaultRoutingSettings.heuristicStepsPerMainStep}, parameter name:
          heuristicStepsPerMainStep).
          <input
            type="number"
            step="1"
            min="0"
            onChange={e =>
              updateInputParam('heuristicStepsPerMainStep', e.target, 0)
            }
            value={merged.heuristicStepsPerMainStep}
          />
        </label>
        <label htmlFor="compactLegsByReversedSearch">
          When true, do a full reversed search to compact the legs of the
          GraphPath. It can remove pointless wait at transit stops at
          performance cost (default{' '}
          {defaultRoutingSettings.compactLegsByReversedSearch.toString()},
          parameter name: compactLegsByReversedSearch):
          <select
            value={merged.compactLegsByReversedSearch}
            onChange={e =>
              updateSelectParam('compactLegsByReversedSearch', e.target)
            }
          >
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        </label>
        <label htmlFor="disableRemainingWeightHeuristic">
          When true, routing uses Dijkstra‘s algorithm instead of default A*
          algorithm. When citybike is selected as one of the available travel
          modes, this parameter is true regardless of what is selected here
          (default{' '}
          {defaultRoutingSettings.disableRemainingWeightHeuristic.toString()},
          parameter name: disableRemainingWeightHeuristic):
          <select
            value={merged.disableRemainingWeightHeuristic}
            onChange={e =>
              updateSelectParam('disableRemainingWeightHeuristic', e.target)
            }
          >
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        </label>
        <label htmlFor="itineraryFiltering">
          How easily bad itineraries are filtered. Value 0 disables filtering.
          The higher the value, the easier less good routes get filtered from
          response. Recommended value range is 0.2 - 5. Value 1 means that if an
          itinerary is twice as worse than another one in some respect (say 100%
          more walking), it will be filtered. Value 0.5 filters 200% worse
          itineraries and value 2 defines 50% filtering level. Value 5 filters
          20% worse routes. (default {defaultRoutingSettings.itineraryFiltering},
          parameter name: itineraryFiltering).
          <input
            type="number"
            step="any"
            min="0"
            onChange={e => updateInputParam('itineraryFiltering', e.target, 0)}
            value={merged.itineraryFiltering}
          />
        </label>
        {this.context.config.transportModes.bus.availableForSelection && (
          <label htmlFor="busWeight">
            The weight of bus traverse mode. Values over 1 add cost to bus
            travel and values under 1 decrease cost (default{' '}
            {defaultRoutingSettings.busWeight}, parameter name: modeWeight.BUS).
            <input
              type="number"
              step="any"
              min="0"
              onChange={e => updateInputParam('busWeight', e.target)}
              value={merged.busWeight}
            />
          </label>
        )}
        {this.context.config.transportModes.rail.availableForSelection && (
          <label htmlFor="railWeight">
            The weight of railway traverse mode. Values over 1 add cost to
            railway travel and values under 1 decrease cost (default{' '}
            {defaultRoutingSettings.railWeight}, parameter name:
            modeWeight.RAIL).
            <input
              type="number"
              step="any"
              min="0"
              onChange={e => updateInputParam('railWeight', e.target)}
              value={merged.railWeight}
            />
          </label>
        )}
        {this.context.config.transportModes.subway.availableForSelection && (
          <label htmlFor="subwayWeight">
            The weight of subway traverse mode. Values over 1 add cost to subway
            travel and values under 1 decrease cost (default{' '}
            {defaultRoutingSettings.subwayWeight}, parameter name:
            modeWeight.SUBWAY).
            <input
              type="number"
              step="any"
              min="0"
              onChange={e => updateInputParam('subwayWeight', e.target)}
              value={merged.subwayWeight}
            />
          </label>
        )}
        {this.context.config.transportModes.tram.availableForSelection && (
          <label htmlFor="tramWeight">
            The weight of tram traverse mode. Values over 1 add cost to tram
            travel and values under 1 decrease cost (default{' '}
            {defaultRoutingSettings.tramWeight}, parameter name:
            modeWeight.TRAM).
            <input
              type="number"
              step="any"
              min="0"
              onChange={e => updateInputParam('tramWeight', e.target)}
              value={merged.tramWeight}
            />
          </label>
        )}
        {this.context.config.transportModes.ferry.availableForSelection && (
          <label htmlFor="ferryWeight">
            The weight of ferry traverse mode. Values over 1 add cost to ferry
            travel and values under 1 decrease cost (default{' '}
            {defaultRoutingSettings.ferryWeight}, parameter name:
            modeWeight.FERRY).
            <input
              type="number"
              step="any"
              min="0"
              onChange={e => updateInputParam('ferryWeight', e.target)}
              value={merged.ferryWeight}
            />
          </label>
        )}
        {this.context.config.transportModes.airplane.availableForSelection && (
          <label htmlFor="airplaneWeight">
            The weight of airplane traverse mode. Values over 1 add cost to
            airplane travel and values under 1 decrease cost (default{' '}
            {defaultRoutingSettings.airplaneWeight}, parameter name:
            modeWeight.AIRPLANE).
            <input
              type="number"
              step="any"
              min="0"
              onChange={e => updateInputParam('airplaneWeight', e.target)}
              value={merged.airplaneWeight}
            />
          </label>
        )}
        <RoutingSettingsButtons onReset={resetParameters} />
      </div>
    );
  }

  render() {
    if (this.props.loading) {
      return (
        <div className="page-frame fullscreen momentum-scroll">
          <Loading />
        </div>
      );
    }
    return this.renderForm();
  }
}

export default AdminForm;
