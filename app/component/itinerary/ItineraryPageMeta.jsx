import React from 'react';
import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import { useMatch } from 'found';

import { otpToLocation } from '../../../utils/shared/otpStrings';
import { generateMetaData } from '../../../utils/client/metaUtils';
import { useConfigContext } from '../../client/ConfigContext';

function ItineraryPageMeta() {
  const config = useConfigContext();
  const intl = useIntl();
  const match = useMatch();
  const { to, from } = match.params;
  const params = {
    from: otpToLocation(from).address,
    to: otpToLocation(to).address,
  };
  const title = intl.formatMessage(
    {
      id: 'summary-page.title',
      defaultMessage: 'Itinerary suggestions',
    },
    params,
  );
  const description = intl.formatMessage(
    {
      id: 'summary-page.description',
      defaultMessage: '{from} - {to}',
    },
    params,
  );
  const props = generateMetaData(
    {
      description,
      title,
    },
    config,
    {
      pathname: `/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
    },
  );
  return <Helmet {...props} />;
}

export default ItineraryPageMeta;
