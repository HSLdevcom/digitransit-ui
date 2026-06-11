import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function NationalServiceLink({ nationalServiceLink }) {
  const config = useConfigContext();
  const link = nationalServiceLink?.[config.language];

  if (!link) {
    return null;
  }

  return (
    <div>
      <FormattedMessage
        id="use-national-service-prefix"
        defaultMessage="You can also try the national service available at"
      />
      <a
        className="no-decoration"
        href={link.href}
        target="_blank"
        rel="noreferrer"
      >
        {link.name}
      </a>
      <FormattedMessage id="use-national-service-postfix" defaultMessage="" />
    </div>
  );
}

NationalServiceLink.propTypes = {
  nationalServiceLink: PropTypes.objectOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    }),
  ),
};
