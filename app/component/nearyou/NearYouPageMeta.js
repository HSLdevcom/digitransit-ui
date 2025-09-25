import React from 'react';
import { Helmet } from 'react-helmet';
import { intlShape } from 'react-intl';
import { matchShape } from 'found';
import { configShape } from '../../util/shapes';
import { generateMetaData } from '../../util/metaUtils';

function NearYouPageMeta({ match }, { config, intl }) {
  const { mode, place, origin } = match.params;
  const title = intl.formatMessage({
    id: 'stops-near-you.title',
    defaultMessage: 'Lähipysäkkien aikataulut',
  });
  const description = intl.formatMessage({
    id: 'stops-near-you.description',
    defaultMessage: 'Lähialueesi pysäkkiaikataulut ja ajoneuvot kartalla.',
  });
  const props = generateMetaData(
    {
      description,
      title,
    },
    config,
    {
      pathname: `/${encodeURIComponent(mode)}/${encodeURIComponent(
        place,
      )}/${encodeURIComponent(origin)}/`,
    },
  );
  return <Helmet {...props} />;
}

NearYouPageMeta.propTypes = {
  match: matchShape.isRequired,
};

NearYouPageMeta.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default NearYouPageMeta;
