import React, { PropTypes } from 'react';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Icon from '../icon/Icon';

const ExternalLink = ({ name, href }) => ((name !== undefined) &&
  <span className="external-link-container">
    <a className="external-link" href={href} >{name}</a>
    <Icon img="icon-icon_external_link_arrow" className="external-link-icon-outer" />
    <Icon img="icon-icon_external_link_arrow" className="external-link-icon" />
  </span>
);

ExternalLink.propTypes = {
  name: PropTypes.string,
  href: PropTypes.string,
};

ExternalLink.description = () => (
  <div>
    <p>
      Link to external url
    </p>
    <ComponentUsageExample description="">
      <span style={{ background: '#007ac9', padding: '10px 10px 10px 10px' }}>
        <ExternalLink name="HSL.fi" href="http://www.hsl.fi" />
      </span>
    </ComponentUsageExample>
  </div>);

export default ExternalLink;
