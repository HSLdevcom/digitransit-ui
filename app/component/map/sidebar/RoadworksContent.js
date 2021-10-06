import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import withBreakpoint from '../../../util/withBreakpoint';
import SidebarContainer from './SidebarContainer';

class RoadworksContent extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
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
      context: { intl },
    } = this;

    const duration = (
      <span className="inline-block padding-vertical-small">
        {RoadworksContent.formatDateTime(
          properties.starttime,
          properties.endtime,
        )}
      </span>
    );

    const url = properties.details_url;
    return (
      <SidebarContainer name={properties.name} description={duration}>
        <div>
          {properties.locationDescription && (
            <p>{properties.locationDescription}</p>
          )}
          <p>{properties.description}</p>
          {url && (
            <p>
              {/* eslint-disable-next-line react/jsx-no-target-blank */}
              <a href={url} target="_blank">
                {intl.formatMessage({
                  id: 'extra-info',
                  defaultMessage: 'More information',
                })}
              </a>
            </p>
          )}
        </div>
      </SidebarContainer>
    );
  }
}

export default withBreakpoint(RoadworksContent);
