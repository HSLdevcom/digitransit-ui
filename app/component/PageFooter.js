import React, { PropTypes } from 'react';
import ComponentUsageExample from './ComponentUsageExample';
import FooterItem from './FooterItem';

const PageFooter = ({ content }) => (<div id="page-footer">
  {content.map(link => (<FooterItem key={link.label || link.name} {...link} />))}
</div>);


PageFooter.propTypes = {
  content: PropTypes.arrayOf(FooterItem.propTypes),
};

PageFooter.defaultProps = {
  content: [],
};

PageFooter.description = () => (
  <div>
    <p>
      Front page footer for large display
    </p>
    <ComponentUsageExample description="">
      <PageFooter
        content={[
        { name: 'Feedback', icon: 'icon-icon_speech-bubble' },
        { name: 'Print', icon: 'icon-icon_print' },
        { name: 'Home', icon: 'icon-icon_place' }]}
      />
    </ComponentUsageExample>
  </div>);

export default PageFooter;
