import PropTypes from 'prop-types';
import React from 'react';
import MenuItem from './MenuItem';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const MainMenuLinks = ({ closeMenu, content }) => (
  <div>
    {content.map(link =>
      Object.keys(link).length === 0 ? (
        <span key="separator" />
      ) : (
        <div key={link.label || link.name} className="offcanvas-section">
          <MenuItem
            onClick={() => {
              if (link.label || link.name) {
                addAnalyticsEvent({
                  category: 'Navigation',
                  action: 'OpenMainMenuLink',
                  name: link.label || link.name,
                });
              }
              if (link.route) {
                closeMenu();
              }
            }}
            {...link}
          />
        </div>
      ),
    )}
  </div>
);

MainMenuLinks.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape(MenuItem.propTypes)),
  closeMenu: PropTypes.func.isRequired,
};

MainMenuLinks.defaultProps = {
  content: [],
};

export default MainMenuLinks;
