import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/lib/Link';
import { FormattedMessage } from 'react-intl';

const EmptyFavouriteLocationSlot = ({ index }) => {
  return (
    <Link
      id={`add-new-favourite-${index}`}
      to="/suosikki/uusi"
      className="cursor-pointer no-decoration"
      key={`add-new-favourite-${index}`}
    >
      <div className="new-favourite-button-content">
        <p className="add-location-text">
          <FormattedMessage id="add-location" defaultMessage="Add location" />
        </p>
      </div>
    </Link>
  );
};

EmptyFavouriteLocationSlot.displayName = 'EmptyFavouriteLocationSlot';

EmptyFavouriteLocationSlot.propTypes = {
  index: PropTypes.number.isRequired,
};

export default EmptyFavouriteLocationSlot;
