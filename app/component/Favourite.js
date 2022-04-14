import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';
import Icon from './Icon';
import { addAnalyticsEvent } from '../util/analyticsUtils';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
const Favourite = (
  {
    addFavourite,
    deleteFavourite,
    favourite,
    isFetching = false,
    className,
    requireLoggedIn,
    isLoggedIn,
    language,
  },
  context,
) => {
  const [disable, handleDisable] = useState(false);
  const [showLoginModal, setLoginModalVisibility] = useState(false);

  useEffect(() => {
    handleDisable(isFetching);
  }, [isFetching]);

  let isModalClosed = false;

  const renderLoginModal = () => {
    const { match, intl } = context;
    const { location } = match;
    const url = encodeURI(`${location.pathname}${location.search}`);

    return (
      <DialogModal
        appElement="#app"
        headerText={intl.formatMessage({
          id: 'login-header',
          defautlMessage: 'Log in first',
        })}
        dialogContent={intl.formatMessage({
          id: 'login-content',
          defautlMessage: 'Log in first',
        })}
        handleClose={() => {
          isModalClosed = true;
          setLoginModalVisibility(false);
          addAnalyticsEvent({
            category: 'Favourite',
            action: 'login cancelled',
            name: null,
          });
        }}
        lang={language}
        isModalOpen={showLoginModal}
        primaryButtonText={intl.formatMessage({
          id: 'login',
          defaultMessage: 'Log in',
        })}
        href={`/login?url=${url}`}
        primaryButtonOnClick={() => {
          setLoginModalVisibility(false);
          addAnalyticsEvent({
            category: 'Favourite',
            action: 'login',
            name: null,
          });
        }}
        secondaryButtonText={intl.formatMessage({
          id: 'cancel',
          defaultMessage: 'cancel',
        })}
        secondaryButtonOnClick={() => {
          isModalClosed = true;
          setLoginModalVisibility(false);
          addAnalyticsEvent({
            category: 'Favourite',
            action: 'login cancelled',
            name: null,
          });
        }}
      />
    );
  };

  const onClick = () => {
    if (!requireLoggedIn || isLoggedIn) {
      if (!disable) {
        handleDisable(true);
        if (favourite) {
          deleteFavourite();
        } else {
          addFavourite();
        }
      }
    } else {
      setLoginModalVisibility(!isModalClosed);
    }
  };

  return (
    <button
      type="button"
      className={cx('cursor-pointer favourite-icon', className)}
      onClick={onClick}
      aria-label={
        favourite && (!requireLoggedIn || isLoggedIn)
          ? context.intl.formatMessage({
              id: 'remove-favourite',
              defautlMessage: 'Remove favourite selection',
            })
          : context.intl.formatMessage({
              id: 'add-to-favourites',
              defautlMessage: 'Set favourite',
            })
      }
    >
      <Icon
        className={cx('favourite', {
          selected: favourite && (!requireLoggedIn || isLoggedIn),
        })}
        img={
          favourite && (!requireLoggedIn || isLoggedIn)
            ? 'icon-icon_star-with-circle'
            : 'icon-icon_star-unselected'
        }
      />
      {renderLoginModal()}
    </button>
  );
};

Favourite.contextTypes = {
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

Favourite.propTypes = {
  addFavourite: PropTypes.func.isRequired,
  deleteFavourite: PropTypes.func.isRequired,
  favourite: PropTypes.bool,
  isFetching: PropTypes.bool,
  className: PropTypes.string,
  requireLoggedIn: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool,
  language: PropTypes.string,
};

Favourite.displayName = 'Favourite';

export default Favourite;
