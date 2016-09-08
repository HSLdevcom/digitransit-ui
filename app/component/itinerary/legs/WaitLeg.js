import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from '../../departure/RouteNumber';
import Icon from '../../icon/icon';
import timeUtils from '../../../util/time-utils';

class WaitLeg extends React.Component {
  render() {
    const duration = timeUtils.durationToString(this.props.leg.duration * 1000);

    return (
      <div style={{ width: '100%' }} className="row itinerary-row">
        <div className="small-2 columns itinerary-time-column">
          <div className="itinerary-time-column-time">
            {moment(this.props.startTime).format('HH:mm')}
          </div>
          <RouteNumber mode="wait" vertical />
        </div>
        <div
          onClick={this.props.focusAction}
          className="small-10 columns itinerary-instruction-column wait"
        >
          <div className="itinerary-leg-first-row">
            <div>
              {this.props.leg.to.name}
              {this.props.children}
              {this.props.leg.from.stop && this.props.leg.from.stop.code && <Icon img="icon-icon_arrow-collapse--right" className="itinerary-leg-first-row__arrow" />}
            </div>
            <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
          </div>
          <div className="itinerary-leg-action">
            <FormattedMessage
              id="wait-amount-of-time"
              values={{ duration: `(${timeUtils.durationToString(this.props.waitTime)})` }}
              defaultMessage="Wait {duration}"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default WaitLeg;
