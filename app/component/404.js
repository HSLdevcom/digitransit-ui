import React from 'react';

import { FormattedMessage } from 'react-intl';

export default function Page() {
  return (
    <div>
      <p>
        <FormattedMessage id="page-not-found" defaultMessage="The page cannot be found." />
      </p>
    </div>
  );
}
