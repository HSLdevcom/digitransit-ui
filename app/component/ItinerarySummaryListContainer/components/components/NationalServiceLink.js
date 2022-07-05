import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

const NationalServiceLink = ({ nationalServiceLink }) =>
  nationalServiceLink && (
    <div>
      <FormattedMessage
        id="use-national-service-prefix"
        defaultMessage="You can also try the national service available at"
      />
      <a className="no-decoration" href={nationalServiceLink.href}>
        {nationalServiceLink.name}
      </a>
      <FormattedMessage id="use-national-service-postfix" defaultMessage="" />
    </div>
  );

NationalServiceLink.propTypes = {
  nationalServiceLink: PropTypes.shape({
    name: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
  }),
};

NationalServiceLink.defaultProps = {
  nationalServiceLink: null,
};

export default NationalServiceLink;
