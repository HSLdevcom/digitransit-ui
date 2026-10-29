import { Helmet } from 'react-helmet';
import { generateManifestUrl } from '../../utils/client/manifestUtils';
import { useConfigContext } from '../hooks/ConfigContext';

function IndexPageMeta() {
  const config = useConfigContext();
  const link = [
    {
      rel: 'manifest',
      href: generateManifestUrl(config, window.location, {
        ignorePathname: true,
      }),
    },
  ];

  return <Helmet link={link} />;
}

export default IndexPageMeta;
