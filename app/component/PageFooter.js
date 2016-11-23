import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';
import FooterItem from './FooterItem';

const PageFooter = ({ content }) => (<div id="page-footer">
  {content.map(link => (<FooterItem {...link} />))}
</div>);

PageFooter.propTypes = {
  content: PropTypes.array.isRequired,
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
      <PageFooter links={[{ name: { fi: 'nimi' }, href: 'http://external/' }]} />
    </ComponentUsageExample>
  </div>);

export default PageFooter;
