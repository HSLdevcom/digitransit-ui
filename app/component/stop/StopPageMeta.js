import React from 'react';
import { Helmet } from 'react-helmet';
import { intlShape } from 'react-intl';
import { useFragment, graphql } from 'react-relay';
import { configShape, stopShape } from '../../util/shapes';
import { generateMetaData } from '../../util/metaUtils';

function StopPageMeta({ stop: stopRef }, { config, intl }) {
  const stop = useFragment(
    graphql`
      fragment StopPageMeta_stop on Stop {
        name
        code
        desc
      }
    `,
    stopRef,
  );

  if (!stop) {
    return false;
  }

  const title = intl.formatMessage(
    {
      id: 'stop-page.title',
      defaultMessage: 'Stop - {name} {code}',
    },
    stop,
  );
  const description = intl.formatMessage(
    {
      id: 'stop-page.description',
      defaultMessage: 'Stop - {name} {code}, {desc}',
    },
    stop,
  );
  const props = generateMetaData(
    {
      description,
      title,
    },
    config,
  );
  return <Helmet {...props} />;
}
StopPageMeta.propTypes = {
  stop: stopShape.isRequired,
};

StopPageMeta.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default StopPageMeta;
