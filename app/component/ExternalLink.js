import React, { PropTypes } from 'react';
import ComponentUsageExample from './ComponentUsageExample';
import FooterItem from './FooterItem';
import ExternalLinkDecoration from './ExternalLinkDecoration';

const ExternalLink = ({ name, children, href, className }) => ((name || children !== undefined) &&
<span className={className} style={{ position: 'relative' }}>
  <span className="external-link-container">
    <a onClick={e => e.stopPropagation()}className="external-link" href={href} >{name || children}</a>
    <ExternalLinkDecoration className="external-link-decoration" />
  </span>
</span>
);

ExternalLink.propTypes = {
  name: PropTypes.string,
  href: PropTypes.string,
  className: PropTypes.string,
};

ExternalLink.defaultProps = {
  className: '',
};

ExternalLink.displayName = 'ExternalLink';

ExternalLink.description = () => (
  <div>
    <p>
      Link to external url
    </p>
    <ComponentUsageExample description="with text only">
      <span style={{ background: '#007ac9', padding: '10px 10px 10px 10px' }}>
        <ExternalLink className="external-top-bar" name="HSL.fi" href="http://www.hsl.fi" />
      </span>
    </ComponentUsageExample>
    <ComponentUsageExample description="with more complex content">
      <span style={{ background: '#ccc', padding: '10px 10px 10px 10px' }}>
        <ExternalLink className="external-top-bar" >
          <FooterItem
            icon="icon-icon_speech-bubble" name="Feedback" href="http://www.hsl.fi"
          /></ExternalLink>
      </span>
    </ComponentUsageExample>
  </div>);

export default ExternalLink;
