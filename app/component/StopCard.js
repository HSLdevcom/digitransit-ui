import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import StopCardHeaderContainer from './StopCardHeaderContainer';
import Card from './Card';

class StopCard extends React.Component {
  render() {
    if (!this.props.stop || !this.props.children || this.props.children.length === 0) {
      return false;
    }
    const prefix = this.props.isTerminal ? 'terminaalit' : 'pysakit';

    return (
      <Link to={`/${prefix}/${this.props.stop.gtfsId}`} className="no-decoration">
        <Card className={this.props.className}>
          <StopCardHeaderContainer
            stop={this.props.stop}
            icons={this.props.icons}
            distance={this.props.distance}
            headingStyle="header-primary"
          />
          {this.props.children}
        </Card>
      </Link>
    );
  }
}

StopCard.propTypes = {
  stop: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
  }),
  icons: PropTypes.arrayOf(PropTypes.node),
  distance: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
  isTerminal: PropTypes.bool,
};

export default StopCard;
