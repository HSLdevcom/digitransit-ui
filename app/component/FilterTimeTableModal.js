import PropTypes from 'prop-types';
import React from 'react';
import intersection from 'lodash/intersection';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import Icon from './Icon';
import routeCompare from '../util/route-compare';

class FilterTimeTableModal extends React.Component {
  static propTypes = {
    stop: PropTypes.object,
    setRoutes: PropTypes.func,
    showFilterModal: PropTypes.func,
    showRoutesList: PropTypes.array,
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
    const chosenRoutes =
      this.state.showRoutes.length > 0 ? this.state.showRoutes.slice() : [];

    const newChosenRoutes =
      chosenRoutes.indexOf(routesToAdd) < 0
        ? chosenRoutes.concat([routesToAdd]) // concat when handling React state based array to avoid array length being assigned as a value
        : chosenRoutes.map(o => o !== routesToAdd && o).filter(o => o);

    if (newChosenRoutes.length === 0) {
      this.updateParent({ showRoutes: newChosenRoutes, allRoutes: true });
      this.setState({ showRoutes: newChosenRoutes, allRoutes: true });
    } else {
      this.updateParent({ showRoutes: newChosenRoutes });
      this.setState({ allRoutes: false, showRoutes: newChosenRoutes });
    }
  };

  constructRouteDivs = () => {
    const routeDivs = [];
    const LONG_LINE_NAME = 5;
    // Find out which departures are ARRIVING to their final stop, not real departures
    // then remove them
    const routesWithStopTimes = this.props.stop.stoptimesForServiceDate
      .map(
        o =>
          o.stoptimes.length > 0 &&
          o.stoptimes[0].pickupType !== 'NONE' && {
            code: o.pattern.code,
            headsign: o.pattern.headsign,
            shortName: o.pattern.route.shortName,
            mode: o.pattern.route.mode,
            agency: o.pattern.route.agency.name,
          },
      )
      .filter(o => o)
      .sort(routeCompare);

    routesWithStopTimes.forEach(o =>
      routeDivs.push(
        <div key={o.code} className="route-row">
          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={intersection(this.state.showRoutes, [o.code]).length > 0}
              id={`input-${o.code}`}
              onChange={() => this.handleCheckbox(o.code)}
            />
            {/* eslint-disable jsx-a11y/label-has-associated-control */}
            <label htmlFor={`input-${o.code}`} />
            {/* eslint-enable jsx-a11y/label-has-associated-control */}
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
          <div className="route-headsign">{o.headsign}</div>
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

  updateParent(newOptions) {
    this.props.setRoutes({
      showRoutes: newOptions.showRoutes,
    });
  }

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const routeList = this.constructRouteDivs();
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
                      this.state.allRoutes === true && e.preventDefault()
                    }
                    onChange={e => {
                      this.toggleAllRoutes(e);
                    }}
                  />
                  {/* eslint-disable jsx-a11y/label-has-associated-control */}
                  <label htmlFor="input-all-routes" />
                  {/* eslint-enable jsx-a11y/label-has-associated-control */}
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
