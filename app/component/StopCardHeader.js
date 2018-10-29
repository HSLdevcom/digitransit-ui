import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import CardHeader from './CardHeader';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import InfoIcon from './InfoIcon';

class StopCardHeader extends React.Component {
  getDescription() {
    let description = '';

    if (
      this.context.config.stopCard.header.showDescription &&
      this.props.stop.desc
    ) {
      description += this.props.stop.desc;
    }

    if (
      this.context.config.stopCard.header.showDistance &&
      this.props.distance
    ) {
      description += ` // ${Math.round(this.props.distance)} m`;
    }

    return description;
  }

  render() {
    const { stop } = this.props;
    if (!stop) {
      return false;
    }

    return (
      <CardHeader
        className={this.props.className}
        headingStyle={this.props.headingStyle}
        name={stop.name}
        description={this.getDescription()}
        code={
          this.context.config.stopCard.header.showStopCode && stop.code
            ? stop.code
            : null
        }
        icons={this.props.icons}
      >
        {stop.zoneId && (
          <div className="zone-information-wrapper">
            {this.context.intl.formatMessage({
              id: 'zone',
              defaultMessage: 'Zone',
            })}
            <Icon img={`icon-icon_zone-${stop.zoneId.toLowerCase()}`} />
          </div>
        )}
      </CardHeader>
    );
  }
}

StopCardHeader.propTypes = {
  stop: PropTypes.shape({
    gtfsId: PropTypes.string,
    name: PropTypes.string,
    code: PropTypes.string,
    desc: PropTypes.string,
    zoneId: PropTypes.string,
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
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

const exampleStop = {
  code: '4611',
  gtfsId: 'HSL:1541157',
  name: 'Kaivonkatsojanpuisto',
  desc: 'Kaivonkatsojantie',
};

const exampleIcons = [<InfoIcon stop={exampleStop} key="example" />];

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
        icons={exampleIcons}
      />
    </ComponentUsageExample>
  </div>
);

export default StopCardHeader;
