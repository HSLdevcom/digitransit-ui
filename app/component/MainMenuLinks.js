import PropTypes from 'prop-types';
import React from 'react';
import ComponentUsageExample from './ComponentUsageExample';
import MenuItem from './MenuItem';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const MainMenuLinks = ({ content }) => (
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
};

MainMenuLinks.defaultProps = {
  content: [],
};

MainMenuLinks.description = () => (
  <div>
    <p>Main menu links for mobile display</p>
    <ComponentUsageExample description="">
      <MainMenuLinks
        content={[
          { name: 'Feedback', icon: 'icon-icon_speech-bubble', route: '/' },
          {},
          { name: 'Print', icon: 'icon-icon_print', route: '/' },
          {},
          { name: 'Home', icon: 'icon-icon_place', route: '/' },
        ]}
      />
    </ComponentUsageExample>
  </div>
);

export default MainMenuLinks;
