import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment-timezone';
import withBreakpoint from '../../../util/withBreakpoint';
import SidebarContainer from './SidebarContainer';

class RoadworksContent extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
  };

  static propTypes = {
    match: PropTypes.object,
  };

  static displayName = 'RoadworksContent';

  static formatDate(date) {
    return date.format('ll');
  }

  static formatTime(dateTime) {
    return dateTime.format('LT');
  }

  static formatDateTime(start, end) {
    const startM = moment(start);
    const endM = moment(end);
    return `${RoadworksContent.formatDate(
      startM,
    )} - ${RoadworksContent.formatDate(endM)}`;
  }

  render() {
    const {
      props: {
        match: {
          location: { query: properties },
        },
      },
    } = this;

    const duration = (
      <span className="inline-block padding-vertical-small">
        {RoadworksContent.formatDateTime(
          properties.starttime,
          properties.endtime,
        )}
      </span>
    );

    return (
      <SidebarContainer name={properties.street} description={duration}>
        <div>{properties.description && <p>{properties.description}</p>}</div>
      </SidebarContainer>
    );
  }
}

export default withBreakpoint(RoadworksContent);
