import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import LoginPrompt from './LoginPrompt';
import Icon from './Icon';
import { useConfigContext } from '../hooks/ConfigContext';

export default function Favourite({
  addFavourite,
  delFavourite,
  favourite = false,
  isFetching = false,
}) {
  const config = useConfigContext();
  const intl = useIntl();
  const [disable, handleDisable] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const buttonRef = useRef(null);
  const enabled = config.allowFavouritesFromLocalstorage || config.user.sub !== undefined;

  // A synchronous (local storage) update does not change isFetching, so the change of favourite
  // also re-enables the button.
  useEffect(() => {
    handleDisable(isFetching);
  }, [isFetching, favourite]);

  const onClick = () => {
    if (enabled) {
      if (!disable) {
        handleDisable(true);
        if (favourite) {
          delFavourite();
        } else {
          addFavourite();
        }
      }
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className="cursor-pointer favourite-icon"
        onClick={onClick}
        aria-label={
          favourite && enabled
            ? intl.formatMessage({
                id: 'remove-favourite',
                defautlMessage: 'Remove favourite selection',
              })
            : intl.formatMessage({ id: 'add-to-favourites', defautlMessage: 'Set favourite' })
        }
      >
        <Icon
          className={cx('favourite', { selected: favourite && enabled })}
          img={favourite && enabled ? 'icon_star-with-circle' : 'icon_star-unselected'}
        />
      </button>
      <LoginPrompt
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onCloseAutoFocus={event => {
          // The prompt has no trigger element, so return focus to the button
          event.preventDefault();
          buttonRef.current?.focus();
        }}
      />
    </>
  );
}

Favourite.propTypes = {
  addFavourite: PropTypes.func.isRequired,
  delFavourite: PropTypes.func.isRequired,
  favourite: PropTypes.bool,
  isFetching: PropTypes.bool,
};
