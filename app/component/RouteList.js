import React from 'react';
import groupBy from 'lodash/groupBy';
import toPairs from 'lodash/toPairs';
import uniq from 'lodash/uniq';
import cx from 'classnames';

import routeCompare from '../util/route-compare';
import RouteNumber from './RouteNumber';

function RouteList(props) {
  const routeObjs =
    toPairs(groupBy(props.routes, route => route.mode.toLowerCase()))
      .map(([mode, routes]) => (
        <div key={mode} className={mode}>
          <RouteNumber
            mode={mode}
            text={` ${
              uniq(routes.sort(routeCompare)
                .filter(route => route.shortName)
                .map(route => route.shortName))
                .join(', ')
              }`}
          />
        </div>
      ));

  return <div className={cx('route-list', props.className)}>{routeObjs}</div>;
}

RouteList.propTypes = {
  className: React.PropTypes.string,
  routes: React.PropTypes.shape({
    mode: React.PropTypes.string.isRequired,
    shortName: React.PropTypes.string,
  }).isRequired,
};

export default RouteList;
