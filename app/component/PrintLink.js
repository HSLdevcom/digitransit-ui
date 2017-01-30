import React from 'react';
import { FormattedMessage } from 'react-intl';
import ExternalLink from './ExternalLink';
import Icon from './Icon';

const PrintLink = ({ className, href }) => href && <ExternalLink className={className} href={href} >
  <Icon img="icon-icon_print" /> <FormattedMessage id="print" defaultMessage="Print" />
</ExternalLink>;

PrintLink.displayName = 'PrintLink';

PrintLink.propTypes = {
  href: React.PropTypes.string,
  className: React.PropTypes.string,
};
export default PrintLink;
