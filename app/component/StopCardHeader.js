import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import CardHeader from './CardHeader';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import ServiceAlertIcon from './ServiceAlertIcon';
import ZoneIcon from './ZoneIcon';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import ExternalLink from './ExternalLink';

class StopCardHeader extends React.Component {
  get headerConfig() {
    return this.context.config.stopCard.header;
  }

  getDescription() {
    let description = '';

    if (this.headerConfig.showDescription && this.props.stop.desc) {
      description += this.props.stop.desc;
    }

    if (this.headerConfig.showDistance && this.props.distance) {
      description += ` // ${Math.round(this.props.distance)} m`;
    }

    return description;
  }

  getExternalLink(code, className) {
    // Check for classname, should the external link be visible
    if(!code || className !== 'stop-page header') {
      return null;
    }
    const url = this.headerConfig.virtualMonitorBaseUrl+""+code
   return this.headerConfig.virtualMonitorBaseUrl ?  <ExternalLink
       className="external-stop-link" href={url}> {'Virtuaalimonitori'} </ExternalLink> : null
  }

  render() {
    const { className, currentTime, headingStyle, icons, stop } = this.props;
    if (!stop) {
      return false;
    }
    return (
      <CardHeader
        className={className}
        headerIcon={
          <ServiceAlertIcon
            className="inline-icon"
            severityLevel={getActiveAlertSeverityLevel(
              stop.alerts,
              currentTime,
            )}
          />
        }
        headingStyle={headingStyle}
        name={stop.name}
        description={this.getDescription()}
        code={this.headerConfig.showStopCode && stop.code ? stop.code : null}
        externalLink={this.getExternalLink(stop.code,className)}
        icons={icons}
      >
        {this.headerConfig.showZone &&
          stop.zoneId && <ZoneIcon showTitle zoneId={stop.zoneId} />}
      </CardHeader>
    );
  }
}

StopCardHeader.propTypes = {
  currentTime: PropTypes.number,
  stop: PropTypes.shape({
    gtfsId: PropTypes.string,
    name: PropTypes.string,
    code: PropTypes.string,
    desc: PropTypes.string,
    zoneId: PropTypes.string,
    alerts: PropTypes.arrayOf(
      PropTypes.shape({
        alertSeverityLevel: PropTypes.string,
        effectiveEndDate: PropTypes.number,
        effectiveStartDate: PropTypes.number,
      }),
    ),
  }),
  distance: PropTypes.number,
  className: PropTypes.string,
  headingStyle: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
};

StopCardHeader.defaultProps = {
  stop: undefined,
};

StopCardHeader.contextTypes = {
  config: PropTypes.shape({
    stopCard: PropTypes.shape({
      header: PropTypes.shape({
        showDescription: PropTypes.bool,
        showDistance: PropTypes.bool,
        showStopCode: PropTypes.bool,
        showZone: PropTypes.bool,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

const exampleStop = {
  code: '4611',
  gtfsId: 'HSL:1541157',
  name: 'Kaivonkatsojanpuisto',
  desc: 'Kaivonkatsojantie',
};

StopCardHeader.displayName = 'StopCardHeader';

StopCardHeader.description = () => (
  <div>
    <ComponentUsageExample description="basic">
      <StopCardHeader stop={exampleStop} distance={345.6} />
    </ComponentUsageExample>
    <ComponentUsageExample description="with icons">
      <StopCardHeader
        stop={exampleStop}
        distance={345.6}
        icons={[
          <Icon className="info" img="icon-icon_info" key="1" />,
          <Icon className="caution" img="icon-icon_caution" key="2" />,
        ]}
      />
    </ComponentUsageExample>
  </div>
);

export default StopCardHeader;
