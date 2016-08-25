import React from 'react';
import Link from 'react-router/lib/Link';
import StopCardHeader from './StopCardHeader';
import Card from '../card/card';

class StopCard extends React.Component {
  render() {
    if (!this.props.stop || !this.props.children || this.props.children.length === 0) {
      return false;
    }

    return (
      <Link to={`/pysakit/${this.props.stop.gtfsId}`} className="no-decoration">
        <Card className={this.props.className}>
          <StopCardHeader
            stop={this.props.stop}
            favourite={this.props.favourite}
            addFavouriteStop={this.props.addFavouriteStop}
            distance={this.props.distance}
            isTerminal={this.props.isTerminal}
          />
          {this.props.children}
        </Card>
      </Link>);
  }
}

StopCard.propTypes = {
  stop: React.PropTypes.object.isRequired,
  children: React.PropTypes.object.isRequired,
  className: React.PropTypes.string,
  favourite: React.PropTypes.bool,
  isTerminal: React.PropTypes.bool,
  addFavouriteStop: React.PropTypes.func,
  distance: React.PropTypes.number,
};

export default StopCard;
