import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import { openFeedbackModal } from '../action/feedbackActions';

const mapToLink = (href, children) => (<span className="cursor-pointer"><a href={href}>{children}</a></span>);

const mapToFn = (fn, children) => (<span className="cursor-pointer"><a onClick={() => { fn(); return false; }}>{children}</a></span>);

const mapToRoute = (router, route, children) => (<span
  className="cursor-pointer"
  onClick={() => {
    router.push(route);
  }}
>{children}</span>);

const getFuntionForType = (type) => {
  switch (type) {
    case 'feedback': return () => context.executeAction(openFeedbackModal);
    default: () => console.log('No function defined for type', type);
  }
  return () => {};
};

const FooterItem = ({ name, href, label, nameEn, route, icon, type }, { router }) => {
  const displayIcon = (icon && <Icon className="footer-icon" img={icon} />) || undefined;
  const displayLabel = label || <FormattedMessage id={name} defaultMessage={nameEn || name} />;
  let item = <span id={name} >{displayIcon}{displayLabel}</span>;
  if (type) {
    item = mapToFn(getFuntionForType(type), item);
  }
  if (href) {
    item = mapToLink(href, item);
  } else if (route) {
    item = mapToRoute(router, route, item);
  }
  return <span className="footer-item">{item}</span>;
};

FooterItem.propTypes = {
  name: PropTypes.string,
  nameEn: PropTypes.string,
  icon: PropTypes.string,
  href: PropTypes.string,
  route: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
};

FooterItem.contextTypes = {
  router: PropTypes.object.isRequired,
  executeAction: PropTypes.func.isRequired,
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
      <FooterItem icon="icon-icon_speech-bubble" name="Feedback" action="foo.bar" />
    </ComponentUsageExample>
  </div>);

export default FooterItem;
