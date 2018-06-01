import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { routerShape, locationShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { getRoutingSettings } from '../store/localStorage';
import SaveRoutingSettingsButton from './SaveRoutingSettingsButton';
import Loading from './Loading';

const AdminForm = ({ router, location, loading, dataConDefaults }) => {
  if (loading) {
    return (
      <div className="page-frame fullscreen momentum-scroll">
        <Loading />
      </div>
    );
  } else {

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

    const toggleRealtimeUpdates = ({ target }) => {
      const ignoreRealtimeUpdates = target.value;
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
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
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
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
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
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
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
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
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
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
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
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
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
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
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
          bikeBoardCost,
        },
      });
    };

    const updateCarParkCarLegWeight = ({ target }) => {
      const carParkCarLegWeight = target.value;
      if (carParkCarLegWeight < 0) {
        alert('Insert a positive number');
        target.value = mergedCurrent.carParkCarLegWeight;
      }
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
          carParkCarLegWeight,
        },
      });
    };

    const updateHeuristicStepsPerMainStep = ({ target }) => {
      const heuristicStepsPerMainStep = target.value;
      if (heuristicStepsPerMainStep < 0) {
        alert('Insert a positive number');
        target.value = mergedCurrent.heuristicStepsPerMainStep;
      }
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
          heuristicStepsPerMainStep,
        },
      });
    };

    const updateParam = (param, target, min) => {
      const newValue = target.value;
      if (newValue < min) {
        alert(`Insert a number that is greater than or equal to ${min}`);
        target.value = mergedCurrent[param];
      }
      router.replace({
        pathname: location.pathname,
        query: {
          ...location.query,
          [param]: value,
        }
      })
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
        <label>
          Cost for car travels. Increase this value to make car trips shorter. (default 1).
          <input type="number" step="any" min="0" onInput={updateCarParkCarLegWeight} onChange={updateCarParkCarLegWeight} value={merged.carParkCarLegWeight}/>
        </label>
        <label>
          The number of heuristic steps per main step when using interleaved bidirectional heuristics. (default 8).
          <input type="number" step="1" min="0" onInput={updateHeuristicStepsPerMainStep} onChange={updateHeuristicStepsPerMainStep} value={merged.heuristicStepsPerMainStep}/>
        </label>
        <SaveRoutingSettingsButton />
      </div>
    );
  }
};

class AdminPage extends React.Component {
  static propTypes = {
    router: routerShape.isRequired,
    location: locationShape.isRequired,
  };
  
 static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  state = { loading: true };

  componentDidMount() {
    const router = this.props.router;
    const location = this.props.location;
    if (this.context.config.CONFIG != 'default') {
      const OTPURLSplit = this.context.config.URL.OTP.split('/');
      const dataContainerURL = `${this.context.config.URL.API_URL}/routing-data/v2/${OTPURLSplit[OTPURLSplit.length - 2]}/router-config.json`;
      fetch(dataContainerURL).then(res => {
        res.json().then(json => {
          this.setState({ router, location, loading: false, dataConDefaults: json.routingDefaults});
        }).catch((err) => {
          this.setState({ router, location, loading: false, dataConDefaults: {}});
        })
      }).catch((err) => {
        this.setState({ router, location, loading: false, dataConDefaults: {}});
      });
    } else {
      this.setState({ router, location, loading: false, dataConDefaults: {}});
    }
  };

  render() {
    return <AdminForm {...this.state} />;
  }
};

export default AdminPage;
