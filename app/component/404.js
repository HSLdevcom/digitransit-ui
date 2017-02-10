import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import Icon from './Icon';

const Error404 = () => (
  <div className="page-not-found">
    <Icon img="icon-icon_error_page_not_found" />
    <p>
      <FormattedMessage id="page-not-found" defaultMessage="The page cannot be found." />
    </p>
    <p>
      <Link to="/">
        <FormattedMessage id="back-to-front-page" defaultMessage="Back to front page ›" />
      </Link>
    </p>
  </div>
);

export default Error404;
