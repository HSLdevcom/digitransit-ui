import { useIntl } from 'react-intl';
import { Helmet } from 'react-helmet';
import { useRouter } from 'found';
import { generateMetaData } from '../../../utils/client/metaUtils';
import { useConfigContext } from '../../hooks/ConfigContext';

export default function NearYouPageMeta() {
  const config = useConfigContext();
  const intl = useIntl();
  const { router, match } = useRouter();
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
    { pathname: router.createHref({ pathname: match.location.pathname }) },
  );
  return <Helmet {...props} />;
}
