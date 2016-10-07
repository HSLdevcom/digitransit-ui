import React from 'react';
import Relay from 'react-relay';
import Icon from '../icon/icon';
import NotImplementedLink from '../util/not-implemented-link';
import CardHeader from '../card/CardHeader';
import config from '../../config';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

class PureStopCardHeader extends React.Component {
  getDescription() {
    let description = '';

    if (config.stopCard.header.showDescription && this.props.stop.desc) {
      description += this.props.stop.desc;
    }

    if (config.stopCard.header.showDistance && this.props.distance) {
      description += ` // ${Math.round(this.props.distance)} m`;
    }

    return description;
  }

  render() {
    return (
      <CardHeader
        addFavourite={this.props.addFavouriteStop}
        className={this.props.className}
        favourite={this.props.favourite}
        headingStyle={this.props.headingStyle}
        name={this.props.stop.name}
        description={this.getDescription()}
        code={config.stopCard.header.showStopCode && this.props.stop.code ?
          this.props.stop.code : null}
      >
        {this.props.infoIcon}
      </CardHeader>
  );
  }
}

PureStopCardHeader.propTypes = {
  stop: React.PropTypes.object,
  distance: React.PropTypes.number,
  addFavouriteStop: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.bool,
  ]).isRequired,
  className: React.PropTypes.string,
  favourite: React.PropTypes.bool,
  headingStyle: React.PropTypes.string,
  infoIcon: React.PropTypes.bool,
};

const exampleStop = {
  code: '4611',
  gtfsId: 'HSL:1541157',
  name: 'Kaivonkatsojanpuisto',
  desc: 'Kaivonkatsojantie',
};

PureStopCardHeader.description = (
  <div>
    <ComponentUsageExample description="basic">
      <PureStopCardHeader stop={exampleStop} distance={345.6} />
    </ComponentUsageExample>
  </div>
);

export { PureStopCardHeader };

export default Relay.createContainer(PureStopCardHeader, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        gtfsId
        name
        code
        desc
      }
    `,
  },
});
