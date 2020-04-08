import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/lib/Link';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

const EmptyFavouriteLocationSlot = ({
  index,
  text,
  defaultMessage,
  iconId,
}) => {
  return (
    <Link
      id={`add-new-favourite-${index}`}
      to="/suosikki/uusi"
      className="new-favourite-location-content cursor-pointer no-decoration"
      key={`add-new-favourite-${index}`}
      aria-label={text}
    >
      <Icon className="favourite-location-icon" img={iconId} />
      <div className="favourite-location">
        <div className="favourite-location-name">
          <FormattedMessage id={text} defaultMessage={defaultMessage} />
        </div>
      </div>
    </Link>
  );
};

EmptyFavouriteLocationSlot.displayName = 'EmptyFavouriteLocationSlot';

EmptyFavouriteLocationSlot.propTypes = {
  index: PropTypes.number.isRequired,
  text: PropTypes.string,
  defaultMessage: PropTypes.string,
  iconId: PropTypes.string,
};

export default EmptyFavouriteLocationSlot;
