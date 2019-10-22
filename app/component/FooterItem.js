import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';

const mapToLink = (href, children, onClick) => (
  <span className="cursor-pointer">
    <a href={href} onClick={onClick}>
      {children}
    </a>
  </span>
);

const mapToRoute = (router, route, children, onClick) => (
  <button
    className="noborder button cursor-pointer"
    onClick={e => {
      router.push(route);
      if (onClick) {
        onClick(e);
      }
    }}
  >
    {children}
  </button>
);

const FooterItem = (
  { name, href, label, nameEn, route, icon, onClick },
  { router },
) => {
  const displayIcon =
    (icon && <Icon className="footer-icon" img={icon} />) || undefined;
  const displayLabel = label || (
    <FormattedMessage id={name} defaultMessage={nameEn || name} />
  );
  let item = (
    <span id={name}>
      {displayIcon}
      {displayLabel}
    </span>
  );
  if (href) {
    item = mapToLink(href, item, onClick);
  } else if (route) {
    item = mapToRoute(router, route, item, onClick);
  } else {
    item = <span className="footer-text">{item}</span>;
  }
  return <span className="footer-item">{item}</span>;
};

FooterItem.propTypes = {
  name: PropTypes.string,
  nameEn: PropTypes.string,
  icon: PropTypes.string,
  href: PropTypes.string,
  route: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
};

FooterItem.contextTypes = {
  router: routerShape.isRequired,
};

FooterItem.displayName = 'FooterItem';

FooterItem.description = () => (
  <div>
    <p>Front page footer item</p>
    <ComponentUsageExample description="external">
      <FooterItem name="Palaute" href="http://www.hsl.fi/" />
    </ComponentUsageExample>
    <ComponentUsageExample description="with icon">
      <FooterItem icon="icon-icon_speech-bubble" name="Feedback" route="/" />
    </ComponentUsageExample>
  </div>
);

export default FooterItem;
