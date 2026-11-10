import { Helmet } from 'react-helmet';
import { useRouter } from 'found';
import { generateManifestUrl } from '../../utils/client/manifestUtils';
import { useConfigContext } from '../hooks/ConfigContext';

export default function IndexPageMeta() {
  const config = useConfigContext();
  const { router } = useRouter();
  const { host, protocol } = window.location;
  const link = [
    {
      rel: 'manifest',
      // The home screen shortcut opens the front page in this language.
      href: generateManifestUrl(config, {
        host,
        protocol,
        pathname: router.createHref({ pathname: '/' }),
      }),
    },
  ];

  return <Helmet link={link} />;
}
