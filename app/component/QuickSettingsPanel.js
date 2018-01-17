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

  render() {
    const arriveBy = get(this.context.location, 'query.arriveBy', 'false');
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
        </div>
      </div>
    );
  }
}

QuickSettingsPanel.propTypes = {
  visible: PropTypes.bool.isRequired,
};

export default QuickSettingsPanel;
