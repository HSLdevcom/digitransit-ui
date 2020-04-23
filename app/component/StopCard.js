import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import StopCardHeaderContainer from './StopCardHeaderContainer';
import Card from './Card';
import { PREFIX_STOPS, PREFIX_TERMINALS } from '../util/path';

function StopCard(props) {
  if (!props.stop || !props.children || props.children.length === 0) {
    return false;
  }
  const prefix = props.isTerminal ? PREFIX_TERMINALS : PREFIX_STOPS;

  return (
    <Link
      to={`/${prefix}/${encodeURIComponent(props.stop.gtfsId)}`}
      className="no-decoration"
    >
      <Card className={props.className}>
        <StopCardHeaderContainer
          stop={props.stop}
          icons={props.icons}
          distance={props.distance}
          isPopUp={props.isPopUp}
          headingStyle="header-primary"
        />
        {props.children}
      </Card>
    </Link>
  );
}

StopCard.propTypes = {
  stop: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
  }),
  icons: PropTypes.arrayOf(PropTypes.node),
  distance: PropTypes.number,
  isPopUp: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  isTerminal: PropTypes.bool,
};

export default StopCard;
