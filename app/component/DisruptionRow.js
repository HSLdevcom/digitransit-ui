import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import RouteList from './RouteList';

function DisruptionRow({ routes, startTime, endTime, description, cause }) {
  return (
    <div className="row">
      <section className="grid-content">
        <div className="disruption-header disruption">
          <RouteList className="left" routes={routes.filter(route => route)} />
          <span className="time bold">
            {startTime.format('HH:mm')} - {endTime.format('HH:mm')}
          </span>
        </div>
        <div className="disruption-content">
          <p>{description}</p>
        </div>
        <div className="disruption-details hide">
          <span>
            <b className="uppercase"><FormattedMessage id="cause" defaultMessage="cause" />:</b>
            {cause}
          </span>
        </div>
      </section>
    </div>
  );
}

DisruptionRow.propTypes = {
  routes: React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
  startTime: React.PropTypes.instanceOf(moment).isRequired,
  endTime: React.PropTypes.instanceOf(moment).isRequired,
  description: React.PropTypes.node,
  cause: React.PropTypes.node,
};

export default DisruptionRow;
