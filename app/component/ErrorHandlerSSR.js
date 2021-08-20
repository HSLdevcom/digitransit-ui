import React from 'react';

import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export default function ErrorHandlerSSR() {
  return (
    <div className="page-not-found">
      <Icon img="icon-icon_error_page_not_found" />
      <p>
        <FormattedMessage
          id="generic-error"
          defaultMessage="There was an error"
        />
      </p>
      <p>
        <button
          type="button"
          onClick={() => {
            if (window && window.location) {
              window.location.reload();
            }
          }}
        >
          <FormattedMessage id="try-again" defaultMessage="Try again ›" />
        </button>
      </p>
    </div>
  );
}
