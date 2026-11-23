import { Helmet } from 'react-helmet';
import { generateManifestUrl } from '../utils/manifestUtils';
import { useConfigContext } from '../hooks/ConfigContext';

export default function IndexPageMeta() {
  const config = useConfigContext();
  const link = [
    {
      rel: 'manifest',
      href: generateManifestUrl(config, window.location, { ignorePathname: true }),
    },
  ];

  return <Helmet link={link} />;
}
