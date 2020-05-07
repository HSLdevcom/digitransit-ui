import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

const FavouriteLocation = ({ favourite, className, clickFavourite }) => {
  const { name, selectedIconId, address } = favourite;

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-tabindex */
  return (
    <div
      className={cx('new-favourite-location-content', className)}
      onKeyPress={e => isKeyboardSelectionEvent(e) && clickFavourite(favourite)}
      onClick={() => clickFavourite(favourite)}
      tabIndex="0"
      aria-label={name}
    >
      <Icon className="favourite-location-icon" img={selectedIconId} />
      <div className="favourite-location">
        <div className="favourite-location-name">{name}</div>
        <div className="favourite-location-address">{address}</div>
      </div>
    </div>
  );
};

FavouriteLocation.propTypes = {
  favourite: PropTypes.object.isRequired,
  clickFavourite: PropTypes.func.isRequired,
  className: PropTypes.string,
};

FavouriteLocation.displayName = 'FavouriteLocation';

export default FavouriteLocation;
