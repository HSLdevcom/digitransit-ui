import React from 'react';

import { FormattedMessage } from 'react-intl';

export default function Page() {
  return (
    <div>
      <p>
        <FormattedMessage id="page-not-found" defaultMessage="Bummer! page is not found" />
      </p>
    </div>
  );
}
