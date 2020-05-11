import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

const FavouriteLocation = ({
  favourite,
  className,
  clickFavourite,
  iconId,
  text,
  defaultMessage,
  isEmpty,
}) => {
  const selectedIconId = isEmpty ? iconId : favourite.selectedIconId;
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-tabindex */
  return (
    <div
      className={cx('new-favourite-location-content', className)}
      onKeyPress={e => isKeyboardSelectionEvent(e) && clickFavourite(favourite)}
      onClick={() => clickFavourite(favourite)}
      tabIndex="0"
      aria-label={isEmpty ? text : favourite.name}
    >
      <Icon className="favourite-location-icon" img={selectedIconId} />
      <div className="favourite-location">
        {isEmpty && (
          <div className="favourite-location-name">
            <FormattedMessage id={text} defaultMessage={defaultMessage} />
          </div>
        )}
        {!isEmpty && (
          <React.Fragment>
            <div className="favourite-location-name">{favourite.name}</div>
            <div className="favourite-location-address">
              {favourite.address}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

FavouriteLocation.propTypes = {
  favourite: PropTypes.object.isRequired,
  clickFavourite: PropTypes.func.isRequired,
  className: PropTypes.string,
  iconId: PropTypes.string,
  text: PropTypes.string,
  defaultMessage: PropTypes.string,
  isEmpty: PropTypes.bool,
};

FavouriteLocation.displayName = 'FavouriteLocation';

export default FavouriteLocation;
