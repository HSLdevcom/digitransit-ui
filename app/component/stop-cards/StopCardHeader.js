import React from 'react';
import Relay from 'react-relay';
import Icon from '../icon/icon';
import NotImplementedLink from '../util/not-implemented-link';
import CardHeader from '../card/CardHeader';
import config from '../../config';

class StopCardHeader extends React.Component {
  getInfoIcon() {
    return (
      <NotImplementedLink
        href={`/pysakit/${this.props.stop.gtfsId}/info`}
        name="info"
        nonTextLink
      >
        <span className="cursor-pointer">
          <Icon className="info right" img="icon-icon_info" />
        </span>
      </NotImplementedLink>
    );
  }

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
        {this.props.infoIcon ? this.getInfoIcon() : null}
      </CardHeader>
  );
  }
}

StopCardHeader.propTypes = {
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

export default Relay.createContainer(StopCardHeader, {
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
