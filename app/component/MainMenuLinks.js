import React, { PropTypes } from 'react';
import ComponentUsageExample from './ComponentUsageExample';
import FooterItem from './FooterItem';

const MainMenuLinks = ({ content }) => (<div id="page-m-footer">

  {content.map(link => ((Object.keys(link).length === 0) ?
    (<span className="footer-separator" />) : <div className="offcanvas-section"><FooterItem key={link.label || link.name} {...link} /></div>))}
</div>);


MainMenuLinks.propTypes = {
  content: PropTypes.arrayOf(FooterItem.propTypes),
};

MainMenuLinks.defaultProps = {
  content: [],
};

MainMenuLinks.description = () => (
  <div>
    <p>
      Main menu links for mobile display
    </p>
    <ComponentUsageExample description="">
      <MainMenuLinks
        content={[
        { name: 'Feedback', icon: 'icon-icon_speech-bubble', route: '/' },
        {},
        { name: 'Print', icon: 'icon-icon_print', route: '/' },
        {},
        { name: 'Home', icon: 'icon-icon_place', route: '/' }]}
      />
    </ComponentUsageExample>
  </div>);

export default MainMenuLinks;
