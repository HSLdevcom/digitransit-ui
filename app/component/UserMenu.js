/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

const UserMenu = ({ menuItems, user }, { intl }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const useMenuRef = useRef(null);
  const { given_name, family_name } = user;

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen(!menuOpen), [menuOpen]);

  const handleClickOutside = event => {
    if (useMenuRef.current && !useMenuRef.current.contains(event.target)) {
      closeMenu();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  const initials =
    given_name && family_name
      ? given_name.charAt(0) + family_name.charAt(0)
      : ''; // Authenticated user's initials, will be shown next to Person-icon.

  return (
    <div ref={useMenuRef} className={cx('usermenu-wrapper')}>
      <button
        id="extendUserMenu"
        type="button"
        className="noborder"
        onClick={toggleMenu}
        aria-label={intl.formatMessage({
          id: 'usermenu',
          defaultMessage: 'User menu',
        })}
        aria-haspopup="true"
        aria-controls="userMenu"
        aria-expanded={menuOpen}
      >
        <div className="usermenu-header">
          <Icon img="icon-icon_user" width={2} height={2} color="#fff" />
          <div className="usermenu-title-text">{initials}</div>
        </div>
      </button>
      <div className={cx('usermenu-container', { open: menuOpen })}>
        {menuOpen && (
          <ul id="userMenu" className="usermenu-list" role="menu">
            {menuItems.map(menuItem => (
              <li role="none" className="usermenu-list-item" key={menuItem.key}>
                <a
                  href={menuItem.href}
                  role="menuitem"
                  onClick={menuItem.onClick}
                  onKeyDown={e => {
                    if (isKeyboardSelectionEvent(e)) {
                      menuItem.onClick(e);
                    }
                  }}
                >
                  {intl.formatMessage({
                    id: menuItem.messageId,
                    defaultMessage: menuItem.messageId,
                  })}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

UserMenu.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      messageId: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func,
    }),
  ).isRequired,
  user: PropTypes.shape({
    given_name: PropTypes.string,
    family_name: PropTypes.string,
    sub: PropTypes.string,
    notLogged: PropTypes.bool,
  }),
};

UserMenu.defaultProps = {
  user: {},
};

UserMenu.contextTypes = {
  intl: intlShape.isRequired,
};

export default UserMenu;
