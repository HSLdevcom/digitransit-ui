import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Link from 'found/Link';
import cx from 'classnames';
import { Text } from '@hsl-fi/layout-primitives';
import { Icon, ArrowRightS } from '@hsl-fi/icons';
import { useBreakpoint } from '../../util/withBreakpoint';
import { useConfigContext } from '../../configurations/ConfigContext';
import { useLogo } from '../../hooks/useLogo';

const AdditionalDescription = () => {
  const intl = useIntl();
  const {
    URL: { HOLIDAYS_AND_EXCEPTIONS, MAJOR_CHANGES },
    language,
  } = useConfigContext();

  const links = [
    {
      key: 'link1',
      href: HOLIDAYS_AND_EXCEPTIONS[language],
      message: {
        id: 'traffic-now_description_see-also--link1',
        defaultMessage: 'holidays and exceptions',
      },
    },
    ...(MAJOR_CHANGES && MAJOR_CHANGES[language]
      ? [
          {
            key: 'link2',
            href: MAJOR_CHANGES[language],
            message: {
              id: 'traffic-now_description_see-also--link2',
              defaultMessage: 'major changes',
            },
          },
        ]
      : []),
  ];

  return (
    <FormattedMessage
      id="traffic-now_description_see-also"
      defaultMessage="See also {link1} as well as {link2}, which you will find in detail on their own pages"
      values={links.reduce(
        (acc, link) => ({
          ...acc,
          [link.key]: (
            <a href={link.href}>{intl.formatMessage(link.message)}</a>
          ),
        }),
        { amount: links.length },
      )}
    />
  );
};

export default function TrafficNowHeader() {
  const breakpoint = useBreakpoint();
  const {
    CONFIG,
    trafficNowHeaderGraphic,
    trafficNowRootPath,
    language,
    URL: { ROOTLINK },
  } = useConfigContext();
  const { formatMessage } = useIntl();

  const { logo } = useLogo(trafficNowHeaderGraphic);
  const desktop = breakpoint === 'large';
  const localizedRootPath = trafficNowRootPath && trafficNowRootPath[language];
  const breadcrumbHref = localizedRootPath
    ? `${ROOTLINK}${localizedRootPath}`
    : undefined;
  const breadcrumbLabel = (
    <Text>{formatMessage({ id: 'traffic-now_bread' })}</Text>
  );
  return (
    <header
      className={cx('traffic-now__header', {
        'traffic-now__header--mobile': !desktop,
      })}
    >
      <span className="traffic-now__header-breadcrumb">
        {breadcrumbHref ? (
          <a href={breadcrumbHref}>{breadcrumbLabel}</a>
        ) : (
          <Link to="/">{breadcrumbLabel}</Link>
        )}
        <Icon icon={ArrowRightS} size="s" />
        <Text>{formatMessage({ id: 'traffic-now' })}</Text>
      </span>
      <Text variant="heading-l" as="h2">
        {formatMessage({ id: 'traffic-now' })}
      </Text>

      <Text variant="text-l" as="p">
        <span>{formatMessage({ id: 'traffic-now_description' })}</span>
        {CONFIG === 'hsl' && <AdditionalDescription />}
      </Text>
      {logo && desktop && (
        <img src={logo} alt="" className="traffic-now__header-image" />
      )}
    </header>
  );
}

TrafficNowHeader.propTypes = {};
