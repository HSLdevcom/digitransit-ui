import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { addAnalyticsEvent } from '../util/analyticsUtils';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
const Favourite = ({
  addFavourite,
  deleteFavourite,
  favourite,
  className,
  allowLogin,
  isLoggedIn,
  getModalTranslations,
}) => {
  const [disable, handleDisable] = useState(false);
  const [showLoginModal, setLoginModalVisibility] = useState(false);

  useEffect(() => {
    handleDisable(false);
  }, [favourite]);

  let isModalClosed = false;

  const renderLoginModal = () => {
    const modalData = getModalTranslations();
    return (
      <DialogModal
        appElement="#app"
        headerText={modalData.text.headerText}
        dialogContent={modalData.text.dialogContent}
        handleClose={() => {
          isModalClosed = true;
          setLoginModalVisibility(false);
          addAnalyticsEvent({
            category: 'Favourite',
            action: 'login cancelled',
            name: null,
          });
        }}
        lang="fi"
        isModalOpen={showLoginModal}
        primaryButtonText={modalData.text.login}
        href="/login"
        primaryButtonOnClick={() => {
          setLoginModalVisibility(false);
          addAnalyticsEvent({
            category: 'Favourite',
            action: 'login',
            name: null,
          });
        }}
        secondaryButtonText={modalData.text.cancel}
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
    if (!allowLogin || isLoggedIn) {
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
    <span
      className={cx('cursor-pointer favourite-icon', className)}
      onClick={onClick}
    >
      <Icon
        className={cx('favourite', {
          selected: favourite && (!allowLogin || isLoggedIn),
        })}
        img={
          favourite && (!allowLogin || isLoggedIn)
            ? 'icon-icon_star-with-circle'
            : 'icon-icon_star-unselected'
        }
      />
      {renderLoginModal()}
    </span>
  );
};

Favourite.propTypes = {
  addFavourite: PropTypes.func.isRequired,
  deleteFavourite: PropTypes.func.isRequired,
  favourite: PropTypes.bool,
  className: PropTypes.string,
  allowLogin: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool,
  getModalTranslations: PropTypes.func,
};

Favourite.description = () => (
  <div>
    <p>
      {`This component shows whether an entity is a favourite
        and allows the user to toggle the favourite status on/off.`}
    </p>
    <ComponentUsageExample description="entity is favourite">
      <Favourite addFavourite={() => {}} deleteFavourite={() => {}} favourite />
    </ComponentUsageExample>
    <ComponentUsageExample description="entity is not favourite">
      <Favourite addFavourite={() => {}} deleteFavourite={() => {}} />
    </ComponentUsageExample>
  </div>
);

Favourite.displayName = 'Favourite';

export default Favourite;
