import React from 'react';
import groupBy from 'lodash/groupBy';
import intersection from 'lodash/intersection';
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
  };

  handleCheckbox = routesToAdd => {
    const oldHiddenRoutes =
      this.state.showRoutes.length > 0 ? this.state.showRoutes.slice() : [];
    let newVal = routesToAdd;
    if (oldHiddenRoutes.length > 0) {
      newVal =
        intersection(oldHiddenRoutes, routesToAdd).length === 0
          ? oldHiddenRoutes.concat(routesToAdd)
          : oldHiddenRoutes.filter(o => routesToAdd.indexOf(o) < 0);
    }
    if (newVal.length === 0) {
      this.updateParent({ showRoutes: newVal, allRoutes: true });
      this.setState({ showRoutes: newVal, allRoutes: true });
    } else {
      this.updateParent({ showRoutes: newVal });
      this.setState({ allRoutes: false, showRoutes: newVal });
    }
  };

  updateParent(newOptions) {
    this.props.setRoutes({
      showRoutes: newOptions.showRoutes,
    });
  }

  constructRouteDivs = val => {
    const routeDivs = [];
    const LONG_LINE_NAME = 5;
    val.forEach(o =>
      routeDivs.push(
        <div key={o.codes[0]} className="route-row">
          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={intersection(this.state.showRoutes, o.codes).length > 0}
              id={`input-${o.codes[0]}`}
              onChange={() => this.handleCheckbox(o.codes)}
            />
            <label htmlFor={`input-${o.codes[0]}`} />
          </div>
          <div className="route-mode">
            <Icon
              className={o.mode.toLowerCase()}
              img={`icon-icon_${o.mode.toLowerCase()}`}
            />
          </div>
          <div
            className={`route-number ${o.mode.toLowerCase()} ${cx({
              'overflow-fade':
                (o.shortName ? o.shortName : o.agency) &&
                (o.shortName ? o.shortName : o.agency).length > LONG_LINE_NAME,
            })}`}
          >
            {o.shortName ? o.shortName : o.agency}
          </div>
          <div className="route-headsign">
            {o.headsign}
          </div>
        </div>,
      ),
    );
    return routeDivs;
  };

  closeModal = e => {
    if (e.target === document.getElementById('stopmodal-relative-overlay')) {
      this.props.showFilterModal(false);
    }
  };

  constructRoutes = () => {
    const patternGroups = groupBy(
      this.props.stop.stoptimesForServiceDate.map(a => a.pattern),
      pattern =>
        JSON.stringify([
          pattern.headsign,
          pattern.route.shortName,
          pattern.route.mode,
          pattern.route.agency.name,
        ]),
    );

    const mappedGroups = Object.entries(patternGroups).map(([key, group]) => [
      JSON.parse(key),
      group.map(pattern => pattern.code),
    ]);
    const cleanedUpavailableRoutes = mappedGroups.map(o => {
      const obj = {};
      obj.headsign = o[0][0];
      obj.shortName = o[0][1];
      obj.mode = o[0][2];
      obj.agency = o[0][3];
      obj.codes = o[1];
      return obj;
    });

    return cleanedUpavailableRoutes;
  };

  render() {
    // const availableRoutes = (
    //    this.props.stop.stoptimesForServiceDate).map(o => Object.assign(o.pattern),
    //    );
    const routes = this.constructRoutes();
    const routeList = this.constructRouteDivs(routes);
    return (
      <div>
        <div className="filter-stop-modal-overlay" />
        <div
          className="filter-stop-modal-fixed-container"
          onClick={e => this.closeModal(e)}
        >
          <div
            className="filter-stop-modal-relative-container"
            id="stopmodal-relative-overlay"
          >
            <div className="filter-stop-modal">
              <div
                className="filter-stop-modal-return"
                id="stopmodal-return"
                onClick={() => this.props.showFilterModal(false)}
              >
                <div className="filter-stop-modal-return-icon">
                  <Icon img="icon-icon_arrow-left" />
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
                    onClick={e =>
                      this.state.allRoutes === true && e.preventDefault()}
                    onChange={e => {
                      this.toggleAllRoutes(e);
                    }}
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
      </div>
    );
  }
}

export default FilterTimeTableModal;
