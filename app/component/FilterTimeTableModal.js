import React from 'react';
import uniqBy from 'lodash/uniqBy';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import Icon from './Icon';

class FilterTimeTableModal extends React.Component {

  static propTypes = {
    stop: React.PropTypes.object,
    setRoutes: React.PropTypes.func,
    showFilterModal: React.PropTypes.func,
    showRoutesList: React.PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      showRoutes: this.props.showRoutesList,
      allRoutes: this.props.showRoutesList.length === 0 && true,
    };
  }

  toggleAllRoutes = () => {
    if (this.state.allRoutes === true) {
      this.setState({
        allRoutes: false,
      });
      this.updateParent({ showRoutes: [] });
    } else {
      this.setState({
        allRoutes: true,
        showRoutes: [],
      });
      this.updateParent({ showRoutes: [] });
    }
  }

  handleCheckbox = (routeId) => {
    const oldHiddenRoutes = this.state.showRoutes.length > 0 ? this.state.showRoutes.slice() : [];
    let newVal = [routeId];
    if (oldHiddenRoutes.length > 0) {
      newVal = oldHiddenRoutes.filter(o => o === routeId).length === 0
    ? oldHiddenRoutes.concat([routeId])
    : oldHiddenRoutes.filter(o => o !== routeId);
    }
    if (newVal.length === 0) {
      this.updateParent({ showRoutes: newVal, allRoutes: true });
      this.setState({ showRoutes: newVal, allRoutes: true });
    } else {
      this.updateParent({ showRoutes: newVal });
      this.setState({ allRoutes: false, showRoutes: newVal });
    }
  }

  updateParent(newOptions) {
    this.props.setRoutes({
      showRoutes: newOptions.showRoutes,
    });
  }

  constructRouteDivs = (val) => {
    const routeDivs = [];
    const LONG_LINE_NAME = 5;
    val.forEach(o =>
    routeDivs.push(
      <div
        key={(o.route.shortName ? o.route.shortName : o.route.longName)}
        className="route-row"
      >
        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={this.state.showRoutes.filter(v =>
            v === (o.route.shortName ? o.route.shortName : o.route.longName)).length > 0}
            id={`input-${o.route.shortName ? o.route.shortName : o.route.longName}`}
            onChange={() => this.handleCheckbox(o.route.shortName)}
          />
          <label htmlFor={`input-${(o.route.shortName ? o.route.shortName : o.route.longName)}`} />
        </div>
        <div className="route-mode">
          <Icon
            className={o.route.mode.toLowerCase()}
            img={`icon-icon_${o.route.mode.toLowerCase()}`}
          />
        </div>
        <div
          className={`route-number ${o.route.mode.toLowerCase()} ${cx({ 'overflow-fade': (o.route.shortName ? o.route.shortName : o.route.longName)
            && (o.route.shortName ? o.route.shortName : o.route.longName).length > LONG_LINE_NAME })}`}
        >{(o.route.shortName ? o.route.shortName : o.route.longName)}</div>
        <div className="route-headsign">{o.headsign}</div>
      </div>));
    return routeDivs;
  }

  closeModal = (e) => {
    if (e.target === document.getElementById('stopmodal-relative-overlay')) {
      this.props.showFilterModal(false);
    }
  }


  render() {
    const availableRoutes = (
        this.props.stop.stoptimesForServiceDate).map(o => Object.assign(o.pattern),
        );
    const cleanedUpavailableRoutes = uniqBy(availableRoutes, 'route.id');
    const routeList = this.constructRouteDivs(cleanedUpavailableRoutes);
    return (<div>
      <div className="filter-stop-modal-overlay" />
      <div className="filter-stop-modal-fixed-container" onClick={e => this.closeModal(e)}>
        <div className="filter-stop-modal-relative-container" id="stopmodal-relative-overlay">
          <div className="filter-stop-modal">
            <div className="filter-stop-modal-return" id="stopmodal-return" onClick={() => this.props.showFilterModal(false)}>
              <div className="filter-stop-modal-return-icon">
                <Icon
                  img="icon-icon_arrow-left"
                />
              </div>
              <div className="filter-stop-modal-return-header">
                <FormattedMessage
                  id="show-routes"
                  defaultMessage="Show Lines"
                />
              </div>
            </div>
            <div className="all-routes-header">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="input-all-routes"
                  checked={this.state.allRoutes}
                  onClick={e => this.state.allRoutes === true && e.preventDefault()}
                  onChange={(e) => { this.toggleAllRoutes(e); }}
                />
                <label htmlFor="input-all-routes" />
              </div>
              <div className="all-routes-header-title">
                <FormattedMessage
                  id="all-routes"
                  defaultMessage="All lines"
                />
              </div>
            </div>
            <div className="routes-container">
              {routeList.length > 0 ? routeList : null}
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}

export default FilterTimeTableModal;
