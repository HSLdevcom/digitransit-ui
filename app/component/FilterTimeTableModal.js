import React from 'react';
import uniqBy from 'lodash/uniqBy';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

class FilterTimeTableModal extends React.Component {

  static propTypes = {
    stop: React.PropTypes.object,
    setRoutes: React.PropTypes.func,
    showFilterModal: React.PropTypes.func,
    showRoutesList: React.PropTypes.array,
    hideAllRoutes: React.PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      showRoutes: this.props.showRoutesList,
      allRoutes: (this.props.showRoutesList.length === 0
      && this.props.hideAllRoutes === false)
      && true,
      hideAllRoutes: this.props.hideAllRoutes,
    };
  }

  toggleAllRoutes = () => {
    if (this.state.allRoutes === true) {
      this.setState({
        allRoutes: false,
        hideAllRoutes: true });
      this.updateParent({ showRoutes: [], hideAllRoutes: true });
    } else {
      this.setState({
        allRoutes: true,
        showRoutes: [],
        hideAllRoutes: false });
      this.updateParent({ showRoutes: [], hideAllRoutes: false });
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
      this.updateParent({ showRoutes: newVal, hideAllRoutes: true });
      this.setState({ showRoutes: newVal });
    } else {
      this.updateParent({ showRoutes: newVal, hideAllRoutes: false });
      this.setState({ allRoutes: false, showRoutes: newVal });
    }
  }

  updateParent(newOptions) {
    this.props.setRoutes({
      showRoutes: newOptions.showRoutes,
      hideAllRoutes: newOptions.hideAllRoutes });
  }

  constructRouteDivs = (val) => {
    const routeDivs = [];
    val.forEach(o =>
    routeDivs.push(
      <div
        key={o.route.shortName}
        className="route-row"
      >
        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={this.state.showRoutes.filter(v => v === o.route.shortName).length > 0}
            id={`input-${o.route.shortName}`}
            onChange={() => this.handleCheckbox(o.route.shortName)}
          />
          <label htmlFor={`input-${o.route.shortName}`} />
        </div>
        <div className="route-mode">
          <Icon
            className={o.route.mode.toLowerCase()}
            img={`icon-icon_${o.route.mode.toLowerCase()}`}
          />
        </div>
        <div className={`route-number ${o.route.mode.toLowerCase()}`}>{o.route.shortName}</div>
        <div className="route-headsign">{o.headsign}</div>
      </div>));
    return routeDivs;
  }


  render() {
    const availableRoutes = (
        this.props.stop.stoptimesForServiceDate).map(o => Object.assign(o.pattern),
        );
    const cleanedUpavailableRoutes = uniqBy(availableRoutes, 'route.id');
    const routeList = this.constructRouteDivs(cleanedUpavailableRoutes);

    return (<div>
      <div className="filter-stop-modal-overlay" onClick={() => this.props.showFilterModal(false)} />
      <div className="filter-stop-modal-fixed-container">
        <div className="filter-stop-modal-relative-container ">
          <div className="filter-stop-modal">
            <div className="filter-stop-modal-return" onClick={() => this.props.showFilterModal(false)}>
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
                  onChange={() => this.toggleAllRoutes()}
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
