import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useRouter } from 'found';

const mapToLink = (href, children, onClick) => (
  <span className="cursor-pointer">
    <a href={href} onClick={onClick} target="_blank" rel="noreferrer">
      {children}
    </a>
  </span>
);

const mapToRoute = (router, route, children, onClick) => (
  <button
    type="button"
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

export default function MenuItem({ name, href, label, route, onClick }) {
  const intl = useIntl();
  const { router } = useRouter();
  const displayLabel = label || (
    <FormattedMessage id={name} defaultMessage={name} />
  );
  let item = <span id={name}>{displayLabel}</span>;
  if (href) {
    if (typeof href === 'object') {
      item = mapToLink(href[intl.locale], item, onClick);
    } else {
      item = mapToLink(href, item, onClick);
    }
  } else if (route) {
    item = mapToRoute(router, route, item, onClick);
  } else {
    item = <span className="menu-text">{item}</span>;
  }
  return <span className="menu-item">{item}</span>;
}

MenuItem.propTypes = {
  name: PropTypes.string,
  href: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.string),
    PropTypes.string,
  ]),
  route: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
};
