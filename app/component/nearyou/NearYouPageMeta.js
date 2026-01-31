import React from 'react';
import { Helmet } from 'react-helmet';
import { matchShape } from 'found';
import { generateMetaData } from '../../util/metaUtils';
import { useTranslationsContext } from '../../util/useTranslationsContext';
import { useConfigContext } from '../../configurations/ConfigContext';

function NearYouPageMeta({ match }) {
  const config = useConfigContext();
  const intl = useTranslationsContext();
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

export default NearYouPageMeta;
