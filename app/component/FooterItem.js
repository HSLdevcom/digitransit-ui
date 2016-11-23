import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';

const mapToLink = (href, children) => (<span className="cursor-pointer"><a href={href}>{children}</a></span>);
const mapToRoute = (router, route, children) => (<span
  className="cursor-pointer"
  onClick={() => {
    router.push(route);
  }}
>{children}</span>);

const FooterItem = ({ name, href, label, nameEn, route, icon }, { router }) => {
  const displayIcon = (icon && <Icon className="footer-icon" img={icon} />) || undefined;
  const displayLabel = label || <FormattedMessage id={name} defaultMessage={nameEn || name} />;
  const item = <span id={name} >{displayIcon}{displayLabel}</span>;
  if (href) {
    return mapToLink(href, item);
  } else if (route) {
    return mapToRoute(router, route, item);
  }
  return item;
};

FooterItem.propTypes = {
  name: PropTypes.string.isRequired,
  nameEn: PropTypes.string.isRequired,
  icon: PropTypes.string,
  href: PropTypes.string,
  route: PropTypes.string,
};

FooterItem.contextTypes = {
  router: PropTypes.object.isRequired,
};

FooterItem.defaultProps = {
  links: [],
};

FooterItem.description = () => (
  <div>
    <p>
      Front page footer item
    </p>
    <ComponentUsageExample description="external">
      <FooterItem name="Palaute" href="http://www.google.com" />
    </ComponentUsageExample>
    <ComponentUsageExample description="with icon">
      <FooterItem icon="icon-icon_speech-bubble" name="People" action="foo.bar" />
    </ComponentUsageExample>
  </div>);

export default FooterItem;
