import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import get from 'lodash/get';
import Icon from './Icon';
// import RightOffcanvasToggle from './RightOffcanvasToggle';

class QuickSettingsPanel extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
  };
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
  };

  setArriveBy = ({ target }) => {
    const arriveBy = target.value;
    this.context.router.replace({
      pathname: this.context.location.pathname,
      query: {
        ...this.context.location.query,
        arriveBy,
      },
    });
  };

  setRouteMode = values => {
    const chosenMode = this.optimizedRouteModes().filter(
      o => Object.keys(o)[0] === values,
    )[0][values];

    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        walkBoardCost: chosenMode.walkBoardCost,
        walkReluctance: chosenMode.walkReluctance,
        transferPenalty: chosenMode.transferPenalty,
      },
    });
  };

  optimizedRouteModes = () => [
    {
      'fastest-route': {
        walkBoardCost: 540,
        walkReluctance: 1.5,
        transferPenalty: 0,
      },
    },
    {
      'least-transfers': {
        walkBoardCost: 540,
        walkReluctance: 3,
        transferPenalty: 5460,
      },
    },
    {
      'least-walking': {
        walkBoardCost: 360,
        walkReluctance: 5,
        transferPenalty: 0,
      },
    },
  ];

  checkModeParams = val => {
    const optimizedRoutes = this.optimizedRouteModes();
    const currentMode = optimizedRoutes
      .map(
        o =>
          JSON.stringify(Object.values(o)[0]) === JSON.stringify(val)
            ? Object.keys(o)[0]
            : undefined,
      )
      .filter(o => o)[0];

    return currentMode || 'fastest-route';
  };

  render() {
    const arriveBy = get(this.context.location, 'query.arriveBy', 'false');
    const getRoute = this.checkModeParams({
      walkBoardCost: Number(get(this.context.location, 'query.walkBoardCost')),
      walkReluctance: Number(
        get(this.context.location, 'query.walkReluctance'),
      ),
      transferPenalty: Number(
        get(this.context.location, 'query.transferPenalty'),
      ),
    });
    return (
      <div
        className={cx([
          'quicksettings-container',
          {
            visible: this.props.visible,
          },
        ])}
      >
        <div className="top-row">
          <div className="select-wrapper">
            <select
              className="arrive"
              value={arriveBy}
              onChange={this.setArriveBy}
            >
              <option value="false">
                {this.context.intl.formatMessage({
                  id: 'leaving-at',
                  defaultMessage: 'Leaving',
                })}
              </option>
              <option value="true">
                {this.context.intl.formatMessage({
                  id: 'arriving-at',
                  defaultMessage: 'Arriving',
                })}
              </option>
            </select>
            <Icon
              className="fake-select-arrow"
              img="icon-icon_arrow-dropdown"
            />
          </div>
          <div className="select-wrapper">
            <select
              className="select-route-modes"
              value={getRoute}
              onChange={e => this.setRouteMode(e.target.value)}
            >
              <option value="fastest-route">
                {this.context.intl.formatMessage({
                  id: 'route-fastest',
                  defaultMessage: 'Fastest route',
                })}
              </option>
              <option value="least-transfers">
                {this.context.intl.formatMessage({
                  id: 'route-least-transfers',
                  defaultMessage: 'Least transfers',
                })}
              </option>
              <option value="least-walking">
                {this.context.intl.formatMessage({
                  id: 'route-least-walking',
                  defaultMessage: 'Least walking',
                })}
              </option>
            </select>
            <Icon
              className="fake-select-arrow"
              img="icon-icon_arrow-dropdown"
            />
          </div>
        </div>
      </div>
    );
  }
}

QuickSettingsPanel.propTypes = {
  visible: PropTypes.bool.isRequired,
};

export default QuickSettingsPanel;
